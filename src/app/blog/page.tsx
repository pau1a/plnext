import { PostCard } from "@/components/post-card";
import cardStyles from "@/components/card.module.scss";
import paginationStyles from "@/components/pagination.module.scss";
import {
  BLOG_AFTER_PARAM,
  BLOG_BEFORE_PARAM,
  BLOG_INDEX_REVALIDATE_SECONDS,
  BlogCursorError,
  createCursorHref,
  getBlogIndexPage,
  parseCursorParam,
} from "@/lib/supabase/blog";
import type { SearchParamRecord } from "@/lib/pagination";
import Link from "next/link";
import { notFound, type ReadonlyURLSearchParams } from "next/navigation";
import type { Metadata } from "next";

const BASE_PATH = "/blog";

export const revalidate = BLOG_INDEX_REVALIDATE_SECONDS;

function resolvePageSize() {
  const raw = process.env.BLOG_PAGE_SIZE ?? process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

const BASE_METADATA: Metadata = {
  title: "Blog",
  description: "Updates on cybersecurity, AI operations, and the engineering work behind them.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Blog",
    description: "Updates on cybersecurity, AI operations, and the engineering work behind them.",
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
    title: "Blog",
    description: "Updates on cybersecurity, AI operations, and the engineering work behind them.",
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

function isURLSearchParamsLike(value: unknown): value is URLSearchParams | ReadonlyURLSearchParams {
  return Boolean(
    value &&
      typeof (value as URLSearchParams).entries === "function" &&
      typeof (value as URLSearchParams).forEach === "function",
  );
}

async function resolveSearchParams(searchParams: SearchParamsInput): Promise<URLSearchParams> {
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

async function getSearchParamValue(
  searchParams: SearchParamsInput,
  key: string,
): Promise<string | string[] | undefined> {
  const params = await resolveSearchParams(searchParams);
  const values = params.getAll(key);

  if (values.length === 0) {
    return undefined;
  }

  return values.length === 1 ? values[0] : values;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const PAGE_SIZE = resolvePageSize();
  const after = parseCursorParam(await getSearchParamValue(searchParams, BLOG_AFTER_PARAM));
  const before = parseCursorParam(await getSearchParamValue(searchParams, BLOG_BEFORE_PARAM));
  const canonicalPath = before
    ? createCursorHref(BASE_PATH, BLOG_BEFORE_PARAM, before)
    : after
      ? createCursorHref(BASE_PATH, BLOG_AFTER_PARAM, after)
      : BASE_PATH;

  try {
    const page = await getBlogIndexPage({ pageSize: PAGE_SIZE, after, before });
    const previous = page.prevCursor
      ? createCursorHref(BASE_PATH, BLOG_BEFORE_PARAM, page.prevCursor)
      : undefined;
    const next = page.nextCursor
      ? createCursorHref(BASE_PATH, BLOG_AFTER_PARAM, page.nextCursor)
      : undefined;

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
      ...(previous || next ? { pagination: { previous, next } } : {}),
    };
  } catch (error) {
    if (error instanceof BlogCursorError) {
      return {
        ...BASE_METADATA,
        alternates: {
          canonical: canonicalPath,
        },
        openGraph: {
          ...BASE_METADATA.openGraph,
          url: canonicalPath,
        },
      };
    }

    console.error("Failed to resolve blog metadata:", error);
    return {
      ...BASE_METADATA,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        ...BASE_METADATA.openGraph,
        url: canonicalPath,
      },
    };
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const PAGE_SIZE = resolvePageSize();
  const after = parseCursorParam(await getSearchParamValue(searchParams, BLOG_AFTER_PARAM));
  const before = parseCursorParam(await getSearchParamValue(searchParams, BLOG_BEFORE_PARAM));

  let page;
  try {
    page = await getBlogIndexPage({ pageSize: PAGE_SIZE, after, before });
  } catch (error) {
    if (error instanceof BlogCursorError) {
      notFound();
    }

    throw error;
  }

  const hasPosts = page.items.length > 0;
  const commentCounts = page.commentCounts;
  const previousHref = page.prevCursor
    ? createCursorHref(BASE_PATH, BLOG_BEFORE_PARAM, page.prevCursor)
    : null;
  const nextHref = page.nextCursor ? createCursorHref(BASE_PATH, BLOG_AFTER_PARAM, page.nextCursor) : null;

  return (
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <section className="u-stack u-gap-2xl">
        <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
          <h1 className="heading-display-lg">Insights &amp; Updates</h1>
          <p className="u-text-lead u-center u-max-w-md">
            Notes from the field on cybersecurity, AI, and practical engineering.
          </p>
        </header>

        {hasPosts ? (
          <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridBlog}`}>
            {page.items.map((post) => (
              <PostCard
                key={post.slug}
                summary={post}
                commentCount={commentCounts ? commentCounts[post.slug] ?? 0 : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="u-text-center u-text-muted">New writing is on the way.</p>
        )}

        {hasPosts ? (
          <nav aria-label="Pagination" className={paginationStyles.pagination}>
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
                  <span className={`${paginationStyles.button} ${paginationStyles.buttonDisabled}`} aria-disabled="true">
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
                  <span className={`${paginationStyles.button} ${paginationStyles.buttonDisabled}`} aria-disabled="true">
                    Older posts
                  </span>
                )}
              </li>
            </ul>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
