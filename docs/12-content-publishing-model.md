_Last updated: 2025-10-21 by gpt-5-codex_

# Content Publishing Model

This document defines how MDX content is structured, how posts and projects move from draft to published, and how comments flow from submission to approval. Use it as the operational guide for writing and moderation.

## 1. MDX Authoring Standards

- **Location:** `src/content/blog` for posts (`YYYY-MM-DD--slug.mdx`) and `src/content/projects` for project write-ups (`slug.mdx`).
- **Front matter:**

  ```yaml
  title: "Post or Project Title"
  slug: "url-safe-slug"
  date: "YYYY-MM-DD"
  summary: "Short, purposeful description"
  cover: "/images/..."
  status: "draft | published"
  tags: ["optional", "later"]
  series:
    title: "optional series title"
    order: 1
  ```

- **Projects** also support:

  ```yaml
  links:
    - { label: "Repo", url: "https://..." }
    - { label: "Case study", url: "https://..." }
  status: "active | archived"
  ```

- Keep slugs stable; never rename after publishing to avoid broken URLs.
- Use Markdown headings consistently (`#`, `##`, `###`) for automatic TOC generation.
- Store media in `/public/images/...` or the CDN (see `05-cdn-and-assets.md`). When using CDN assets in MDX, prefer the `ContentImage` helper for responsive sizing and alignment:

  ```mdx
  <ContentImage
    src="https://cdn.networklayer.co.uk/paulalivingstone/images/1000001988.jpg"
    alt="Peep keeping watch over the control room"
    caption="Peep keeping watch over the control room."
    align="right"       // options: default | left | right | wide
    width={1200}         // optional intrinsic dimensions
    height={800}
  />
  ```

  The component clamps width to fit the prose column, floats left/right on larger screens, and falls back to a 16:9 aspect ratio if no dimensions are supplied. Markdown `![alt](url "caption")` automatically routes through `ContentImage`, so titles become captions and alignment defaults to the centered layout.
- Tags are defined centrally in `src/lib/tags.ts`. Reuse the existing slugs when updating front matter (`tags: ["application-security", "operations"]`). If a genuinely new tag is required, add it to the registry with a readable name and optional aliases before using it in any content.

## 2. Draft to Publish Workflow

1. Create MDX with `status: "draft"` and commit to a feature branch.
2. Peer review content and structure. Update metadata (date, summary, tags, series order) as part of review.
3. Flip `status` to `published` and merge to main.
4. Rebuild site (automatic on merge). Because pages are statically generated, new content appears on next deploy.

## 3. Blog Series & Tags

- **Series:** Add the `series` block in front matter with `title` and `order`. Posts render series metadata on detail pages and appear in `/blog/series/[series-slug]` sorted by `order` then `date`.
- **Tags:** Tag array is dormant until “tags on” milestone. When ready, populate `tags` array; UI surfaces `/blog/tags` registry and per-tag filters.

## 4. Comment Lifecycle

1. Visitor submits comment via `/api/comments` (honeypot + dwell time enforced).
2. Record stored as `pending` with `ip_hash` and sanitized `body`.
3. Operator reviews queue in Supabase. Approve → `status: approved` (triggers counter update). Mark spam to exclude from public view.
4. Approved comments surface on `/blog/[slug]` via client fetch. Comment counts on `/blog` update via `post_comment_counts` trigger.
5. Delete or spam actions decrement counters automatically.

## 5. Contact Workflow

- Submissions arrive via `/api/contact` and enter `contact_messages` with `status: new`.
- Operator acknowledges and updates status to `acknowledged` or `archived` as resolved.
- Follow-up responses occur manually (email). No automated replies.

## 6. Governance & Audit

- Maintain changelog of published posts and major project updates in `docs/` (see `03-content-model/`).
- Archive old drafts rather than deleting when they provide historical context.
- Keep moderation notes in Supabase or `docs/` decisions if policies shift (e.g., auto-approve trusted contributors).

## 7. SEO & Accessibility Touchpoints

- Provide descriptive `summary` values; they seed meta descriptions, RSS excerpts, and card previews.
- Include alt text for all inline images. Use MDX JSX props where needed.
- Set canonical URLs and structured data via the App Router metadata exports (see `app/layout.tsx` and `10-site-structure-overview.md`).

This model keeps writing flow predictable while ensuring comments and contact remain well-governed. Update alongside any changes to the MDX pipeline or moderation tooling.
