# Content Model — Blog Posts

Front-matter schema (MDX):
```yaml
title: "Title"
slug: "my-slug"          # permanent identifier
date: "2025-10-14"
summary: "One-sentence hook."
tags: ["security","systems"]   # free-form, many allowed
categorySlug: ""               # optional for now; leave empty or omit
image: "/images/blog/my-slug/cover.webp"
draft: false
updated: ""                    # optional ISO date
```

Writing style:

* Clear, technical, human. Avoid hype.
* Prefer diagrams / code over stock imagery.
* Add a short “Why it matters” block where useful.
