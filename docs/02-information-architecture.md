# Information Architecture

## Routes (v1)
- `/` — Home
- `/about/`
- `/projects/` and `/projects/[slug]/`
- `/blog/` and `/blog/[slug]/`
- `/contact/`
- Optional later: `/lab/`, `/reading/`

## URL Strategy (decided)
- Blog posts live at `/blog/[slug]` (flat).
- Categories, when introduced, are listing pages only: `/blog/category/[slug]`.
- Tags live at `/tags/[slug]`.
- Rationale: post URLs never change → no link rot. See decisions/0001-url-strategy.md
