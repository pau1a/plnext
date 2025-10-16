_Last updated: 2025-01-05 by gpt-5-codex_

# Admin RBAC model

The moderation console relies on short-lived session cookies that are issued after
submitting a valid access token on `/admin/login`. Tokens are configured through
the `ADMIN_AUTH_USERS` environment variable and evaluated entirely on the server
(middleware, layouts, and server actions). The configuration format is a JSON
array where each entry contains an `id`, `name`, `token`, and a list of `roles`.

```jsonc
[
  {
    "id": "moderator",
    "name": "Queue Moderator",
    "token": "moderator-token",
    "roles": ["moderator"]
  },
  {
    "id": "admin",
    "name": "Site Admin",
    "token": "admin-token",
    "roles": ["admin", "moderator"]
  }
]
```

## Roles and permissions

| Role       | Permissions                                                              | Use case                               |
|------------|---------------------------------------------------------------------------|----------------------------------------|
| `viewer`   | `comments:view`                                                           | Read-only access for audits or demos.  |
| `moderator`| `comments:view`, `comments:moderate`                                      | Day-to-day comment triage and actions. |
| `admin`    | `comments:view`, `comments:moderate`, `audit:read`                        | Full control plus audit log review.    |

The `/admin/comments` layout requires the `comments:moderate` permission. Users
without that capability are redirected back to the sign-in form and any existing
session cookie is invalidated.

## Session handling

- Sessions are signed with an HMAC derived from `ADMIN_SESSION_SECRET` and the
  user’s token. No raw tokens are persisted in cookies.
- Cookies are HTTP-only, `SameSite=Lax`, and expire after eight hours by default.
- Middleware enforces access control for every `/admin/*` request before a page
  or action handler runs.

## Audit expectations

Each moderation action writes an entry to `pl_site.moderation_audit_log` with the
actor ID, name, role list, the comment identifier, and any optional notes. This
ensures the governance log can be reconstructed from Supabase alone.
