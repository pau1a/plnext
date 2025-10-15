_Last updated: 2025-10-14 by PL_

# Privacy & Security (Baseline)

- Contact: minimal data; server-side validation; rate limiting; spam protection.
- Analytics: privacy-first; no cookies.
- Legal stubs to add pre-launch: /privacy, /terms.
- Security headers intent: HTTPS only; HSTS; basic CSP (tighten later).

## Comments
- Submission: stored immediately in Supabase with `approved=false`.
- Publication: visible publicly only after Paula sets `approved=true`.
- Removal: on request, delete the comment row in Supabase and clear any cached copies.

## Contact Messages
- Private by default; never displayed publicly.
- Handling: toggle `handled` to `true` after action and retain for correspondence history unless deletion is requested.

## Data Subject Requests
- Accept removal or export requests via email.
- Record fulfillment steps (date, requester, row id, action) in an internal log.

