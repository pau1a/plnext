_Last updated: 2025-10-14 by PL_

# Content Model — Projects

Front-matter schema (MDX):

```yaml
title: "Project Name"
slug: "project-slug"
year: 2025
summary: "Outcome-focused one-liner."
stack: ["nextjs","rust","pytorch"]
image: "/images/projects/project-slug/cover.webp"
links:
  repo: ""
  demo: ""
status: "public" # or "private"
```

Recommended structure:

- Problem → Approach → Outcome
- 2–4 images or diagrams
- Code links only if public

Front-matter fields will be mirrored by TypeScript interfaces in a future tooling phase for IDE autocompletion.
