_Last updated: 2025-10-14 by PL_

# Information Architecture

## Routes (v1)

- `/` — Home. See [Front Page Architecture](./ui/00-front-page-architecture.md) for entry-point layout.
- `/about/`
- `/projects/` and `/projects/[slug]/`
- `/blog/` and `/blog/[slug]/`
- `/contact/`
- Optional later: `/lab/`, `/reading/`

## URL Strategy (decided)

- Blog posts live at `/blog/[slug]` (flat).
- Categories, when introduced, are listing pages only: `/blog/category/[slug]`. Formal category launch is deferred; see [ADR 0002](./decisions/0002-categories-later.md).
- Tags live at `/tags/[slug]`.
- Rationale: post URLs never change → no link rot. [See ADR 0001](../decisions/0001-url-strategy.md).

## Static vs. SSR

- Statically generated: `/`, `/about/`, `/projects/`, `/projects/[slug]/`, `/blog/`, `/blog/[slug]/`, and `/contact/`.
- All other present or future routes default to SSR/CSR until explicitly documented otherwise.

## Example route table

```ts
// pages/blog/[slug].tsx
export async function getStaticPaths() {
  const slugs = await loadBlogSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await loadBlogPost(params.slug);
  return { props: { post } };
}
```
