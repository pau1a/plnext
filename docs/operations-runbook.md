_Last updated: 2025-10-22 by gpt-5-codex_

# Operations Runbook

## On-demand Revalidation Verification

Publishing a new post or approving moderated content requires forcing the ISR
cache to refresh so that the CDN serves the latest blog index and article
payloads. Use the secured revalidation endpoint together with the helper script
to verify that behaviour across local, staging, and production environments.

### Prerequisites

- `ADMIN_REVALIDATE_TOKEN` configured for the target environment and stored in
  the hosting secret manager.
- Script available at [`scripts/verify-revalidation.sh`](../scripts/verify-revalidation.sh).
- `curl`, `awk`, and `date` utilities available in the operator shell (standard
  on macOS/Linux).

### Local verification flow

1. Start the Next.js development server.
2. Export the administrative token: `export REVALIDATE_TOKEN=$ADMIN_REVALIDATE_TOKEN`.
3. Run the helper script after publishing or moderating a post:

   ```bash
   scripts/verify-revalidation.sh example-slug
   ```

   - `REVALIDATE_URL` defaults to `http://localhost:3000/api/revalidate`.
   - Add extra paths as arguments if the moderation action affects auxiliary
     routes (e.g., `scripts/verify-revalidation.sh example-slug /contact`).

4. Review the output:
   - `Revalidation acknowledged` should appear within a few hundred
     milliseconds and list the blog index and affected slug tags.
   - `Elapsed time between trigger and first fetch` captures how long the ISR
     rebuild took. For local runs expect < 3s; escalate if the window grows or
     stalls.
   - `Key response headers` must show the updated caching metadata (see below).
   - `Second fetch ... HIT` confirms the CDN/edge cache accepted the refreshed
     payload.

### Staging / production verification flow

1. Set the endpoint to the deployed origin:

   ```bash
   export REVALIDATE_URL="https://staging.paulalivingstone.com/api/revalidate"
   export TARGET_BASE_URL="https://staging.paulalivingstone.com"
   export REVALIDATE_TOKEN="$(pass paula/staging/revalidate)"
   scripts/verify-revalidation.sh example-slug
   ```

2. Record the script output in the moderation log alongside the action being
   verified (slug, operator initials, timestamp).
3. If the script shows a cached response on the first fetch (`x-nextjs-cache:
   HIT`), re-run after a brief delay. Persistent cache hits indicate the ISR
   worker has not finished rebuilding—raise an incident if the delay exceeds the
   60s `s-maxage` window.

### Expected CDN/cache headers

The script prints the key headers to confirm CDN policy enforcement:

- `Cache-Control: public, s-maxage=60, stale-while-revalidate=60` — derived from
  `BLOG_INDEX_REVALIDATE_SECONDS`. Any higher `s-maxage` risks stale content;
  lower values may thrash rebuilds.
- `x-nextjs-cache`: expect `MISS` or `REVALIDATED` immediately after the
  trigger, and `HIT` on the second fetch.
- `Age`: should reset to `0` following a successful revalidation.
- `Content-Encoding`: `br` or `gzip` indicates compression is active end-to-end.
- `ETag`: value should change when the blog content updates; record the hash in
  the moderation log for traceability.

If headers deviate from the above, cross-check the CDN configuration in
[CDN Invalidation Workflow](./05-cdn-and-assets-invalidation.md) and capture
headers with `curl -I` for the incident report.

### Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `401 Unauthorized` | Token missing/incorrect. Rotate the secret and update the deployment environment. |
| `500 Server misconfiguration` | `ADMIN_REVALIDATE_TOKEN` absent on the server. Populate the secret and redeploy. |
| `Revalidation failed` | Inspect server logs for ISR errors (Supabase outage, build failures). Retry once, then escalate. |
| `Second fetch` still `MISS` after several attempts | CDN may not be caching (check response headers); confirm CDN integration and report to infrastructure. |

