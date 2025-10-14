# CDN & Assets (Decided)

**CDN prefix**  
`https://cdn.networklayer.co.uk/paulalivingstone/`

**Subdirectories**  
- `images/`, `videos/`, `documents/`

**Content convention**  
- MDX stores **relative** paths (e.g., `/images/blog/slug/cover.webp`).
- Runtime resolves to CDN in production; local paths in development.

**Structure guidance**
```
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
