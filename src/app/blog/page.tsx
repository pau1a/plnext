import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import cardStyles from "@/components/card.module.scss";
import { getBlogPostSummaries } from "@/lib/mdx";
import {
  buildPageHref,
  DEFAULT_PAGE_PARAM,
  resolvePaginationState,
  type SearchParamRecord,
} from "@/lib/pagination";
import type { Metadata } from "next";

const BASE_PATH = "/blog";
const PAGE_SIZE = 6;
const PAGE_PARAM = DEFAULT_PAGE_PARAM;

const BASE_METADATA: Pick<Metadata, "title" | "description"> = {
  title: "Blog",
  description: "Updates on cybersecurity, AI operations, and the engineering work behind them.",
};

type SearchParamsInput = SearchParamRecord | Promise<SearchParamRecord> | undefined;

interface BlogPageProps {
  searchParams?: SearchParamsInput;
}

async function normalizeSearchParams(
  searchParams: SearchParamsInput,
): Promise<SearchParamRecord | undefined> {
  if (!searchParams) {
    return undefined;
  }

  const candidate = searchParams as Promise<SearchParamRecord> | SearchParamRecord;
  return typeof (candidate as Promise<SearchParamRecord>)?.then === "function"
    ? await (candidate as Promise<SearchParamRecord>)
    : (candidate as SearchParamRecord);
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const posts = await getBlogPostSummaries();
  const totalCount = posts.length;
  const resolvedSearchParams = await normalizeSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const previous = state.currentPage > 1 ? buildPageHref(BASE_PATH, state.currentPage - 1, PAGE_PARAM) : undefined;
  const hasNext = totalCount > 0 && state.currentPage < state.totalPages;
  const next = hasNext ? buildPageHref(BASE_PATH, state.currentPage + 1, PAGE_PARAM) : undefined;

  return {
    ...BASE_METADATA,
    ...(previous || next ? { pagination: { previous, next } } : {}),
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = await getBlogPostSummaries();
  const totalCount = posts.length;
  const resolvedSearchParams = await normalizeSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const hasPosts = totalCount > 0;
  const visiblePosts = hasPosts ? posts.slice(state.startIndex, state.endIndex) : [];

  return (
    <section className="u-stack u-gap-2xl">
      <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
        <h1 className="heading-display-lg">Insights &amp; Updates</h1>
        <p className="u-text-lead u-center u-max-w-md">
          Notes from the field on cybersecurity, AI, and practical engineering.
        </p>
      </header>

      {hasPosts ? (
        <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridBlog}`}>
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} summary={post} />
          ))}
        </div>
      ) : (
        <p className="u-text-center u-text-muted">New writing is on the way.</p>
      )}

      {hasPosts ? (
        <Pagination
          totalCount={totalCount}
          pageSize={state.pageSize}
          currentPage={state.currentPage}
          basePath={BASE_PATH}
          pageParam={PAGE_PARAM}
        />
      ) : null}
    </section>
  );
}
