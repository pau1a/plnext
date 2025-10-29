import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { search } from "@/lib/search";
import SearchResultItem from "./SearchResult";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}

async function resolveSearchParams(
  searchParams: SearchPageProps["searchParams"]
): Promise<{ q?: string }> {
  if (!searchParams) {
    return {};
  }

  if (searchParams instanceof Promise) {
    return await searchParams;
  }

  return searchParams;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await resolveSearchParams(searchParams);
  const query = params.q || "";

  const title = query ? `Search results for "${query}"` : "Search";
  const description = query
    ? `Search results for "${query}" across essays, blog posts, projects, notes, and stream.`
    : "Search across all content on Paula Livingstone's site.";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await resolveSearchParams(searchParams);
  const query = params.q || "";

  const results = query ? await search({ query }) : [];

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <div className="u-stack u-gap-2xl">
          <header className="u-stack u-gap-sm u-text-center u-mb-2xl">
            <h1 className="u-heading-display">
              {query ? `Search results for "${query}"` : "Search"}
            </h1>
            {query ? (
              <p className="u-text-lead u-center u-max-w-md">
                Found {results.length} {results.length === 1 ? "result" : "results"} across essays, blog posts, projects, notes, and stream.
              </p>
            ) : (
              <p className="u-text-lead u-center u-max-w-md">
                Enter a search query to find content across the site.
              </p>
            )}
          </header>

          {!query ? (
            <div className="u-text-center u-text-muted">
              <p>Use the search box above to search across all content.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="u-text-center u-text-muted">
              <p>
                No results found for &ldquo;{query}&rdquo;.
              </p>
              <p className="u-mt-sm">Try different keywords or check your spelling.</p>
            </div>
          ) : (
            <section className="u-stack u-gap-lg" aria-label="Search results">
              {results.map((result) => (
                <SearchResultItem key={`${result.type}-${result.slug}`} result={result} />
              ))}
            </section>
          )}
        </div>
      </MotionFade>
    </PageShell>
  );
}
