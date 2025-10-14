_Last updated: 2025-10-14 by PL_

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

[See CDN invalidation workflow stub](05-cdn-and-assets-invalidation.md) for upcoming cache refresh process details.

## Cross-references

- Dynamic user data (comments and contact messages) lives in Supabase. See `09-database-and-services.md` for the data layer overview.
- Media continues to publish via the CDN prefix above.
