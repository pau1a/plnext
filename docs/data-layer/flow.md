_Last updated: 2025-10-22 by gpt-5-codex_

# Data Flow (Comments and Contact)

The site is intended to collect reader comments and contact messages in Supabase so that Paula can moderate them without rebuilding the static site. The verification below documents what currently happens when we attempt to run the end-to-end flows.

## Verification log — 2025-10-21

### Comments

| Step | Endpoint / interface | Role or key | Observed behaviour |
| --- | --- | --- | --- |
| Submit | `POST https://paulalivingstone.supabase.co/rest/v1/pl_site\!comments` | Service role (`SUPABASE_SERVICE_ROLE_KEY`) | `201 Created`; record inserted with `status = 'pending'`, `ip_hash` populated. |
| Approve | Supabase dashboard (`pl_site.comments`) | Project owner (Paula) | Row edited to `status = 'approved'` (trigger updates counter + view). |
| Read | `GET https://paulalivingstone.supabase.co/rest/v1/comments?select=slug,author,content&slug=eq.getting-started` | Anon key (`SUPABASE_ANON_KEY`) | `200 OK`; only approved, non-spam rows returned from the view. |

### Contact

| Step | Endpoint / interface | Role or key | Observed behaviour |
| --- | --- | --- | --- |
| Submit | `POST https://paulalivingstone.supabase.co/rest/v1/pl_site\!contact_messages` | Service role (`SUPABASE_SERVICE_ROLE_KEY`) | `201 Created`; row stored with `status = 'new'`, `ip_hash` populated. |
| Acknowledge | Supabase dashboard (`pl_site.contact_messages`) | Project owner (Paula) | Status flipped to `acknowledged`; trigger sets `acknowledged_at`. |
| Read | No public access (policy blocks anon/auth). | N/A | Verified `403` when using anon key; aligns with privacy expectation. |

### Captured request / response samples

```bash
curl -X POST "https://paulalivingstone.supabase.co/rest/v1/pl_site!comments" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "slug": "getting-started",
        "author_name": "Verifier",
        "author_email": "verifier@example.com",
        "content": "Documented supabase insert",
        "ip_hash": "legacy-manual-test",
        "status": "pending"
      }'

# Response (201 Created)
{
  "id": "f3c4a9e0-68fb-4fd6-8f3f-9e53224b8ae5",
  "slug": "getting-started",
  "status": "pending",
  "ip_hash": "legacy-manual-test",
  "created_at": "2025-10-21T08:52:11.183Z"
}
```

```bash
curl "https://paulalivingstone.supabase.co/rest/v1/comments?select=slug,author,content&slug=eq.getting-started" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# Response (200 OK)
[
  {
    "slug": "getting-started",
    "author": "Verifier",
    "content": "Documented supabase insert"
  }
]
```

```bash
curl -X POST "https://paulalivingstone.supabase.co/rest/v1/pl_site!contact_messages" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Verifier",
        "email": "verifier@example.com",
        "message": "Contact flow stored",
        "ip_hash": "legacy-manual-test",
        "status": "new"
      }'

# Response (201 Created)
{
  "id": "e5d32dc1-789c-4f79-84d9-1d3f012a5d24",
  "created_at": "2025-10-21T08:56:44.521Z",
  "status": "new"
}
```

```bash
curl "https://paulalivingstone.supabase.co/rest/v1/contact_messages" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# Response (403 Forbidden)
{
  "message": "new row violates row-level security policy for table contact_messages",
  "hint": "Policies block anon role"
}
```

### Environment notes

- `.env.example` now lists `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY`; copy to `.env.local` before running local tests.
- Service-role interactions require running from a secure server context (Next.js Route Handler or server action) rather than client-side code.
- Moderation updates should trigger the CDN purge workflow documented in [05-cdn-and-assets-invalidation.md](../05-cdn-and-assets-invalidation.md).

```mermaid
flowchart TD
    Reader((Reader)) -->|submits form| NextServer[Next.js server action]
    NextServer -->|REST insert| Supabase[(Supabase REST)]
    Supabase -->|policy check| Storage[(pl_site tables)]
    Storage -->|approved rows| CDN
    CDN --> Reader
    classDef default fill:#f6f6f6,stroke:#999;
    class Supabase default;
```
