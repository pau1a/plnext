_Last updated: 2025-10-21 by gpt-5-codex_

# CDN & Assets (Decided)

**CDN prefix**
`https://cdn.networklayer.co.uk/paulalivingstone/`

**Subdirectories**

- `images/`, `videos/`, `documents/`

**Content convention**

- MDX stores **relative** paths (e.g., `/images/blog/slug/cover.webp`).
- Runtime resolves to CDN in production; local paths in development.

**Structure guidance**

```text
/images/
blog/<slug>/*
projects/<slug>/*
ui/*
/videos/
demos/*
/documents/
whitepapers/*
```

**Caching intent**

- Fingerprinted filenames preferred (e.g., `cover.ab12cd34.webp`).
- Long-lived caching on images/videos; shorter on documents unless versioned.

[See CDN invalidation workflow](05-cdn-and-assets-invalidation.md) for cache refresh process details and purge commands.

## Cross-references

- Dynamic user data (comments and contact messages) lives in Supabase. See [Data Layer Overview](./09-database-and-services.md).
- Media continues to publish via the CDN prefix above.
