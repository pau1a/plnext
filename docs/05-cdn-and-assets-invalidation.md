_Last updated: 2025-10-22 by gpt-5-codex_

# CDN Invalidation Workflow

Purpose: describe how cached assets on <https://cdn.networklayer.co.uk/paulalivingstone/> are refreshed when content or moderation status changes.

## Publication pipeline

1. **Authoring** — Update MDX documents following the [Content Model — Blog Posts](./03-content-model/blog.md) requirements (and related content models). Front matter status moves from `draft` → `review` → `published` inside Git.
2. **Build & deploy** — Merging to the default branch triggers the Next.js build. Static outputs (HTML, JSON, images) are uploaded to the CDN. See the static boundary explained in [Data Layer Overview](./09-database-and-services.md) for where this step ends.
3. **Primary purge** — After assets arrive, purge the changed paths through Network Layer’s dashboard: `PaulaLivingstone > Cache > Purge by URL`, paste the fully qualified paths, and submit. Clear the changed slug plus `/blog`, `/projects`, and relevant tag archives.
4. **Secondary purge** — Invalidate the corresponding Next.js ISR cache entries by calling `/_next/revalidate?tag=<slug>` (or the configured on-demand revalidation endpoint) so that the CDN receives the updated HTML on the next request.

## Moderation-driven updates

User submissions bypass the static build and land directly in Supabase as described in [Data Flow (Comments and Contact)](./data-layer/flow.md). Paula reviews them under the stewardship rules defined in [Governance](./07-governance.md) and applies the privacy controls outlined in [Privacy & Security](./08-privacy-and-security.md).

When a submission moves from `status='pending'` to `status='approved'` (or a contact message is anonymised/deleted):

1. Update the record in Supabase.
2. Trigger a targeted revalidation for the affected page(s).
   - Comments: revalidate the specific post slug.
   - Contact page: revalidate `/contact` if any confirmation copy depends on moderation state.
3. Purge the CDN cache for those pages so that browsers stop seeing stale responses. This is the dynamic half of the boundary documented in [Data Layer Overview](./09-database-and-services.md).
4. Record the action in the moderation log (Notion) for traceability per governance requirements.

## Cache catalogue

| Layer | What is cached | How to invalidate | Notes |
| --- | --- | --- | --- |
| Browser | HTML, images | User refresh / `Cache-Control` headers | Short max-age; rely on CDN purge for fresh assets. |
| CDN | Static assets, ISR responses | Dashboard purge (manual) or `curl` API call below | Document purge commands once tooling is selected. |
| Next.js ISR | Page HTML/JSON | `/_next/revalidate?tag=<...>` | Protect endpoint with secret token. |
| Supabase | Query results | Not cached server-side; changes are immediate | Ensure client fetches request fresh data after moderation. |

### Network Layer purge API (optional automation)

```bash
# Purge specific URLs
curl \
  -X POST https://api.networklayer.co.uk/v1/cache/purge \
  -H "Authorization: Bearer $NETWORKLAYER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "zone": "paulalivingstone",
        "urls": [
          "https://cdn.networklayer.co.uk/paulalivingstone/blog/example-post",
          "https://cdn.networklayer.co.uk/paulalivingstone/blog"
        ]
      }'
```

- API key lives in `NETWORKLAYER_API_KEY` and is stored alongside Supabase secrets (see [Governance](./07-governance.md)).
- Purging `"paths": ["/paulalivingstone/*"]` is available but should be limited to emergency full-cache resets.

## Operational follow-up

- Record each purge (manual or API) in the moderation log with timestamp and operator initials.
- Add runbooks linking to this workflow inside the on-call section of [Governance](./07-governance.md).
- Keep privacy considerations at the forefront: if personal data is removed, confirm caches are cleared as described in [Privacy & Security](./08-privacy-and-security.md).
