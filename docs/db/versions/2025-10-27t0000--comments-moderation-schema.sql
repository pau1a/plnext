-- Migration: Update comments table for moderation system
-- Date: 2025-10-27
-- Description: Migrates from old comments structure (post_slug, name, body, approved)
--              to new moderation structure (slug, author_name, content, status)
--              and adds moderation_audit_log table

SET search_path = pl_site, pg_catalog;

-- Step 1: Drop old indexes
DROP INDEX IF EXISTS ix_comments_post_slug_created_at;

-- Step 2: Backup existing comments if the table exists
-- (This helps preserve data during migration)
DO $$
BEGIN
  -- Drop old backup if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'pl_site' AND table_name = 'comments_backup') THEN
    DROP TABLE comments_backup;
  END IF;

  -- Only create backup if comments table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'pl_site' AND table_name = 'comments') THEN
    CREATE TABLE comments_backup AS SELECT * FROM comments;
  END IF;
END $$;

-- Step 3: Drop the old comments table
DROP TABLE IF EXISTS comments CASCADE;

-- Step 4: Create new comments table with moderation fields
CREATE TABLE comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    slug text NOT NULL,
    author_name text NOT NULL,
    author_email text,
    content text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    is_spam boolean NOT NULL DEFAULT false,
    ip_hash text NOT NULL,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    moderated_at timestamptz,
    CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'spam'))
);

ALTER TABLE comments OWNER TO postgres;

-- Step 5: Create indexes for moderation
CREATE INDEX ix_comments_slug_created_at ON comments (slug, created_at ASC);
CREATE INDEX ix_comments_status_created_at ON comments (status, created_at DESC);

-- Step 6: Migrate old data if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'pl_site' AND table_name = 'comments_backup') THEN
    INSERT INTO comments (
      id,
      slug,
      author_name,
      author_email,
      content,
      status,
      is_spam,
      ip_hash,
      user_agent,
      created_at,
      updated_at,
      moderated_at
    )
    SELECT
      id,
      post_slug as slug,
      name as author_name,
      email as author_email,
      body as content,
      CASE WHEN approved THEN 'approved' ELSE 'pending' END as status,
      false as is_spam,
      COALESCE(ip_hash, 'migrated-no-hash') as ip_hash,
      user_agent,
      created_at,
      created_at as updated_at,
      CASE WHEN approved THEN created_at ELSE NULL END as moderated_at
    FROM comments_backup;
  END IF;
END $$;

-- Step 7: Create moderation_audit_log table
CREATE TABLE IF NOT EXISTS moderation_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    comment_id uuid NOT NULL,
    action text NOT NULL,
    actor_id text NOT NULL,
    actor_name text NOT NULL,
    actor_roles text[] NOT NULL,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT moderation_audit_log_comment_id_fkey FOREIGN KEY (comment_id)
      REFERENCES comments(id) ON DELETE CASCADE
);

ALTER TABLE moderation_audit_log OWNER TO postgres;

-- Create index for audit log lookups
CREATE INDEX ix_moderation_audit_log_comment_id_created_at
  ON moderation_audit_log (comment_id, created_at DESC);

-- Step 8: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION comments_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_set_updated_at ON comments;
CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION comments_set_updated_at();

-- Step 9: Create or replace post_comment_counts table
CREATE TABLE IF NOT EXISTS post_comment_counts (
    slug text NOT NULL PRIMARY KEY,
    approved_count integer NOT NULL DEFAULT 0,
    last_approved_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE post_comment_counts OWNER TO postgres;

-- Step 10: Create trigger to sync comment counts
CREATE OR REPLACE FUNCTION comments_sync_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.status = 'approved' AND NEW.is_spam = false THEN
      INSERT INTO post_comment_counts (slug, approved_count, last_approved_at, updated_at)
      VALUES (
        NEW.slug,
        1,
        NEW.created_at,
        timezone('utc'::text, now())
      )
      ON CONFLICT (slug) DO UPDATE SET
        approved_count = (
          SELECT COUNT(*)
          FROM comments
          WHERE slug = NEW.slug
            AND status = 'approved'
            AND is_spam = false
        ),
        last_approved_at = (
          SELECT MAX(created_at)
          FROM comments
          WHERE slug = NEW.slug
            AND status = 'approved'
            AND is_spam = false
        ),
        updated_at = timezone('utc'::text, now());
    END IF;
  END IF;

  -- Handle DELETE or status change from approved
  IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved')) THEN
    DECLARE
      old_slug text := COALESCE(OLD.slug, '');
      remaining_count integer;
    BEGIN
      SELECT COUNT(*) INTO remaining_count
      FROM comments
      WHERE slug = old_slug
        AND status = 'approved'
        AND is_spam = false;

      IF remaining_count = 0 THEN
        DELETE FROM post_comment_counts WHERE slug = old_slug;
      ELSE
        UPDATE post_comment_counts SET
          approved_count = remaining_count,
          last_approved_at = (
            SELECT MAX(created_at)
            FROM comments
            WHERE slug = old_slug
              AND status = 'approved'
              AND is_spam = false
          ),
          updated_at = timezone('utc'::text, now())
        WHERE slug = old_slug;
      END IF;
    END;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_sync_counts ON comments;
CREATE TRIGGER comments_sync_counts
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION comments_sync_counts();

-- Step 11: Recreate the public.comments view
CREATE OR REPLACE VIEW public.comments AS
SELECT
  id,
  slug,
  author_name as author,
  content,
  created_at
FROM pl_site.comments
WHERE status = 'approved' AND is_spam = false;

-- Grant select on the view to anon and authenticated roles
GRANT SELECT ON public.comments TO anon;
GRANT SELECT ON public.comments TO authenticated;

-- Step 12: Update schema version
INSERT INTO schema_version (id, version, updated_at)
VALUES (1, '2025-10-27T0000', timezone('utc'::text, now()))
ON CONFLICT (id) DO UPDATE
SET version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;

-- Optional: Clean up backup table after successful migration
-- Uncomment the following line if you want to drop the backup automatically
-- DROP TABLE IF EXISTS comments_backup;

-- Migration complete
