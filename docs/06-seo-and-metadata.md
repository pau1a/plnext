_Last updated: 2025-10-14 by PL_

# SEO & Metadata

See [Database & Services](./09-database-and-services.md) for backend-driven capabilities that inform metadata automation.

- Global defaults: title template, description, canonical, OG/Twitter.
- Per-page overrides for blog posts and projects.
- OG images should point to the CDN.
- Sitemap & robots to be generated pre-launch.
- No tracking cookies; analytics via Plausible/Umami (anonymised).

## Code examples

Global defaults live in `_app-providers.tsx` via the shared `<DefaultSeo>` component. Override values per page with `next-seo`:

```tsx
import { NextSeo } from "next-seo";

export default function BlogPostSeo() {
  return (
    <NextSeo
      title="Post Title | Paula Livingstone"
      description="Short summary..."
      openGraph={{ url: "https://paulalivingstone.com/blog/post-slug" }}
    />
  );
}
```

## Crawl and Indexing Notes

- User comments are rendered dynamically from Supabase and are not part of the prerendered HTML, so search engines may not index them. Treat them as non-indexed supporting content unless server-rendered.
