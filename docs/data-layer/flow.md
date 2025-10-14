# Data Flow (Comments and Contact)

1. A reader loads a static blog post (`/blog/[slug]`).
2. The client requests approved comments for that slug from a server endpoint (read-only).
3. When a reader submits a comment, the server endpoint writes to Supabase with `approved = false`.
4. Paula reviews and approves comments in the Supabase dashboard.
5. Approved comments surface on subsequent page loads with no rebuild.

**Contact form**

1. A reader submits the contact form.
2. The server endpoint writes to Supabase with `handled = false`.
3. Paula reviews and marks entries as handled when complete.
