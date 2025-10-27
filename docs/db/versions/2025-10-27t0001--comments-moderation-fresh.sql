-- Migration: Create fresh comments moderation system
-- Date: 2025-10-27
-- Description: Creates new moderation structure from scratch
--              Safe to run even if old tables exist

-- Ensure pl_site schema exists
CREATE SCHEMA IF NOT EXISTS pl_site;

-- Drop old structure completely if it exists
DROP TABLE IF EXISTS pl_site.comments CASCADE;
DROP TABLE IF EXISTS pl_site.comments_backup CASCADE;
DROP INDEX IF EXISTS pl_site.ix_comments_post_slug_created_at CASCADE;

-- Create new comments table with moderation fields
CREATE TABLE pl_site.comments (
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

ALTER TABLE pl_site.comments OWNER TO postgres;

-- Enable RLS
ALTER TABLE pl_site.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY allow_service_writes ON pl_site.comments
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY allow_public_reads ON pl_site.comments
  FOR SELECT
  USING (status = 'approved' AND is_spam = false);

-- Create indexes for moderation
CREATE INDEX ix_comments_slug_created_at ON pl_site.comments (slug, created_at ASC);
CREATE INDEX ix_comments_status_created_at ON pl_site.comments (status, created_at DESC);

-- Create moderation_audit_log table
DROP TABLE IF EXISTS pl_site.moderation_audit_log CASCADE;

CREATE TABLE pl_site.moderation_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    comment_id uuid NOT NULL,
    action text NOT NULL,
    actor_id text NOT NULL,
    actor_name text NOT NULL,
    actor_roles text[] NOT NULL,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT moderation_audit_log_comment_id_fkey FOREIGN KEY (comment_id)
      REFERENCES pl_site.comments(id) ON DELETE CASCADE
);

ALTER TABLE pl_site.moderation_audit_log OWNER TO postgres;

-- Create index for audit log lookups
CREATE INDEX ix_moderation_audit_log_comment_id_created_at
  ON pl_site.moderation_audit_log (comment_id, created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION pl_site.comments_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON pl_site.comments
  FOR EACH ROW
  EXECUTE FUNCTION pl_site.comments_set_updated_at();

-- Create or replace post_comment_counts table
DROP TABLE IF EXISTS pl_site.post_comment_counts CASCADE;

CREATE TABLE pl_site.post_comment_counts (
    slug text NOT NULL PRIMARY KEY,
    approved_count integer NOT NULL DEFAULT 0,
    last_approved_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE pl_site.post_comment_counts OWNER TO postgres;

-- Create trigger to sync comment counts
CREATE OR REPLACE FUNCTION pl_site.comments_sync_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.status = 'approved' AND NEW.is_spam = false THEN
      INSERT INTO pl_site.post_comment_counts (slug, approved_count, last_approved_at, updated_at)
      VALUES (
        NEW.slug,
        1,
        NEW.created_at,
        timezone('utc'::text, now())
      )
      ON CONFLICT (slug) DO UPDATE SET
        approved_count = (
          SELECT COUNT(*)
          FROM pl_site.comments
          WHERE slug = NEW.slug
            AND status = 'approved'
            AND is_spam = false
        ),
        last_approved_at = (
          SELECT MAX(created_at)
          FROM pl_site.comments
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
      FROM pl_site.comments
      WHERE slug = old_slug
        AND status = 'approved'
        AND is_spam = false;

      IF remaining_count = 0 THEN
        DELETE FROM pl_site.post_comment_counts WHERE slug = old_slug;
      ELSE
        UPDATE pl_site.post_comment_counts SET
          approved_count = remaining_count,
          last_approved_at = (
            SELECT MAX(created_at)
            FROM pl_site.comments
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

CREATE TRIGGER comments_sync_counts
  AFTER INSERT OR UPDATE OR DELETE ON pl_site.comments
  FOR EACH ROW
  EXECUTE FUNCTION pl_site.comments_sync_counts();

-- Recreate the public.comments view
DROP TABLE IF EXISTS public.comments CASCADE;
DROP VIEW IF EXISTS public.comments CASCADE;

CREATE VIEW public.comments AS
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

-- Create schema_version table if it doesn't exist
CREATE TABLE IF NOT EXISTS pl_site.schema_version (
    id integer NOT NULL PRIMARY KEY,
    version text NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE pl_site.schema_version OWNER TO postgres;

-- Update schema version
INSERT INTO pl_site.schema_version (id, version, updated_at)
VALUES (1, '2025-10-27T0001', timezone('utc'::text, now()))
ON CONFLICT (id) DO UPDATE
SET version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;

-- Migration complete
