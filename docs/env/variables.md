_Last updated: 2025-10-21 by gpt-5-codex_
# Environment Variables (Names Only)

- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — server-side key for privileged writes.
- `SUPABASE_ANON_KEY` — read/write key used by the public API surface.

Values are never committed. Store secrets in server-side environment management (e.g., hosting control panel).

For local development, copy `.env.local.example` to `.env.local` and populate the Supabase values before running the app. Next.js only reads the env file on startup, so restart the dev server after editing.
