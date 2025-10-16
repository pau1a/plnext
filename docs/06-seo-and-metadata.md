_Last updated: 2025-10-21 by gpt-5-codex_

# SEO & Metadata

See [Database & Services](./09-database-and-services.md) for backend-driven capabilities that inform metadata automation.

- Global defaults: title template, description, canonical, OG/Twitter.
- Per-page overrides for blog posts and projects.
- OG images should point to the CDN.
- Sitemap & robots to be generated pre-launch.
- No tracking cookies; analytics via Plausible/Umami (anonymised).

## Code examples

Global defaults live in `app/layout.tsx` via the exported `metadata` object. Per-route overrides should use `generateMetadata` in App Router segments:

```tsx
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const post = await getPost();

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: "article",
      url: `https://paulalivingstone.com/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
```

## Crawl and Indexing Notes

- User comments are rendered dynamically from Supabase and are not part of the prerendered HTML, so search engines may not index them. Treat them as non-indexed supporting content unless server-rendered.
