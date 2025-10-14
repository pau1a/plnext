_Last updated: 2025-10-14 by PL_

# Content Model — Blog Posts

Front-matter schema (MDX):

```yaml
title: "Title"
slug: "my-slug"          # required, permanent identifier
date: "2025-10-14"       # required, ISO 8601
summary: "One-sentence hook."  # required
tags: ["security","systems"]   # required, at least one tag
categorySlug: ""               # optional for now; leave empty or omit
image: "/images/blog/my-slug/cover.webp"  # required hero asset
status: "draft"               # draft | review | published
updated: ""                    # optional ISO date for revisions
```

**Field requirements**

- `title`, `slug`, `date`, `summary`, `tags`, `image`, and `status` must be present for every post.
- `categorySlug` remains optional until categories launch.
- `updated` is optional and records the most recent significant edit.

Writing style:

- Clear, technical, human. Avoid hype.
- Prefer diagrams / code over stock imagery.
- Add a short “Why it matters” block where useful.

Front-matter fields will be mirrored by TypeScript interfaces in a future tooling phase for IDE autocompletion.
