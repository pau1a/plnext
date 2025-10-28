import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { PostCard } from "@/components/post-card";
import cardStyles from "@/components/card.module.scss";
import paginationStyles from "@/components/pagination.module.scss";
import { getBlogPostSummaries } from "@/lib/mdx";
import { getSupabase } from "@/lib/supabase/server";
import type { SearchParamRecord } from "@/lib/pagination";
import Link from "next/link";
import { type ReadonlyURLSearchParams } from "next/navigation";
import type { Metadata } from "next";

const BASE_PATH = "/writing";
const PAGE_SIZE = 6;

export const revalidate = 60;

const BASE_METADATA: Metadata = {
  title: "Writing",
  description:
    "Updates on cybersecurity, AI operations, and the engineering work behind them.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Writing",
    description:
      "Updates on cybersecurity, AI operations, and the engineering work behind them.",
    url: BASE_PATH,
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    title: "Writing",
    description:
      "Updates on cybersecurity, AI operations, and the engineering work behind them.",
    images: ["/window.svg"],
  },
};

type SearchParamsInput =
  | SearchParamRecord
  | URLSearchParams
  | ReadonlyURLSearchParams
  | Promise<SearchParamRecord | URLSearchParams | ReadonlyURLSearchParams>
  | undefined;

interface BlogPageProps {
  searchParams?: SearchParamsInput;
}

function isURLSearchParamsLike(
  value: unknown,
): value is URLSearchParams | ReadonlyURLSearchParams {
  return Boolean(
    value &&
      typeof (value as URLSearchParams).entries === "function" &&
      typeof (value as URLSearchParams).forEach === "function",
  );
}

async function resolveSearchParams(
  searchParams: SearchParamsInput,
): Promise<URLSearchParams> {
  if (!searchParams) {
    return new URLSearchParams();
  }

  const candidate = searchParams as
    | Promise<SearchParamRecord | URLSearchParams | ReadonlyURLSearchParams>
    | SearchParamRecord
    | URLSearchParams
    | ReadonlyURLSearchParams;
  const resolved =
    typeof (candidate as Promise<SearchParamRecord>)?.then === "function"
      ? await (candidate as Promise<SearchParamRecord>)
      : candidate;

  if (!resolved) {
    return new URLSearchParams();
  }

  if (isURLSearchParamsLike(resolved)) {
    return new URLSearchParams(resolved as URLSearchParams);
  }

  const params = new URLSearchParams();
  const record = resolved as SearchParamRecord;
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    } else {
      params.append(key, value);
    }
  }

  return params;
}

async function getPageNumber(searchParams: SearchParamsInput): Promise<number> {
  const params = await resolveSearchParams(searchParams);
  const page = params.get("page");
  const parsed = page ? parseInt(page, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function loadCommentCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};

  try {
    const supabase = getSupabase();
    // public.comments is a view that only shows approved comments, no status filter needed
    const { data, error } = await supabase
      .from("comments")
      .select("slug")
      .in("slug", slugs);

    if (error) {
      console.error("Supabase query error:", error.message);
      throw new Error(`Supabase error: ${error.message}`);
    }

    const counts: Record<string, number> = {};
    for (const slug of slugs) {
      counts[slug] = 0;
    }

    for (const row of (data ?? []) as Array<{ slug: string }>) {
      if (counts[row.slug] !== undefined) {
        counts[row.slug] += 1;
      }
    }

    return counts;
  } catch (error) {
    console.error("Failed to load comment counts:", error instanceof Error ? error.message : String(error));
    // Return empty counts on error to prevent UI issues
    const counts: Record<string, number> = {};
    for (const slug of slugs) {
      counts[slug] = 0;
    }
    return counts;
  }
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const page = await getPageNumber(searchParams);
  const canonicalPath = page > 1 ? `${BASE_PATH}?page=${page}` : BASE_PATH;

  return {
    ...BASE_METADATA,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...BASE_METADATA.openGraph,
      url: canonicalPath,
    },
    twitter: {
      ...BASE_METADATA.twitter,
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = await getPageNumber(searchParams);

  // Get all posts, excluding drafts
  const allPosts = await getBlogPostSummaries({ includeDrafts: false });

  // Calculate pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const posts = allPosts.slice(startIndex, endIndex);

  // Load comment counts
  const commentCounts = await loadCommentCounts(posts.map(p => p.slug));

  const hasPosts = posts.length > 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const previousHref = hasPreviousPage ? (page === 2 ? BASE_PATH : `${BASE_PATH}?page=${page - 1}`) : null;
  const nextHref = hasNextPage ? `${BASE_PATH}?page=${page + 1}` : null;

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <section className="u-stack u-gap-2xl">
        <MotionFade>
          <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
            <h1 className="u-heading-display">Insights &amp; Updates</h1>
            <p className="u-text-lead u-center u-max-w-md">
              Notes from the field on cybersecurity, AI, and practical
              engineering.
            </p>
          </header>
        </MotionFade>

        {hasPosts ? (
          <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridBlog}`}>
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                summary={post}
                commentCount={commentCounts[post.slug] ?? 0}
              />
            ))}
          </div>
        ) : (
          <MotionFade>
            <p className="u-text-center u-text-muted">
              New writing is on the way.
            </p>
          </MotionFade>
        )}

        {hasPosts && totalPages > 1 ? (
          <MotionFade delay={0.05}>
            <nav
              aria-label="Pagination"
              className={paginationStyles.pagination}
            >
              <ul className={paginationStyles.list}>
                <li className={paginationStyles.item}>
                  {previousHref ? (
                    <Link
                      className={paginationStyles.button}
                      href={previousHref}
                      aria-label="View newer posts"
                      prefetch={false}
                    >
                      Newer posts
                    </Link>
                  ) : (
                    <span
                      className={`${paginationStyles.button} ${paginationStyles.buttonDisabled}`}
                      aria-disabled="true"
                    >
                      Newer posts
                    </span>
                  )}
                </li>
                <li className={paginationStyles.item}>
                  {nextHref ? (
                    <Link
                      className={paginationStyles.button}
                      href={nextHref}
                      aria-label="View older posts"
                      prefetch={false}
                    >
                      Older posts
                    </Link>
                  ) : (
                    <span
                      className={`${paginationStyles.button} ${paginationStyles.buttonDisabled}`}
                      aria-disabled="true"
                    >
                      Older posts
                    </span>
                  )}
                </li>
              </ul>
            </nav>
          </MotionFade>
        ) : null}
      </section>
    </PageShell>
  );
}
