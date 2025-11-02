import "server-only";

import { unstable_cache } from "next/cache";

import { getBlogPostSummaries, type BlogPostSummary } from "@/lib/mdx";

import { getSupabase, type PostsTableRow } from "./server";

export const BLOG_INDEX_REVALIDATE_SECONDS = 60;
export const BLOG_LIST_CACHE_TAG = "supabase:blog:index" as const;
const BLOG_POST_CACHE_TAG_PREFIX = "supabase:blog:post:" as const;

export function getBlogPostCacheTag(slug: string) {
  return `${BLOG_POST_CACHE_TAG_PREFIX}${slug}`;
}

export const BLOG_AFTER_PARAM = "after" as const;
export const BLOG_BEFORE_PARAM = "before" as const;

export class BlogCursorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogCursorError";
  }
}

export interface BlogIndexPageOptions {
  pageSize: number;
  after?: string | null;
  before?: string | null;
}

export interface BlogIndexPageResult {
  items: BlogPostSummary[];
  nextCursor: string | null;
  prevCursor: string | null;
  commentCounts: Record<string, number> | null;
}

interface CursorPayload {
  insertedAt: string;
  slug: string;
}

const DEFAULT_PAGE_SIZE = 1;

function clampPageSize(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.floor(raw);
}

function encodeCursor(row: Pick<PostsTableRow, "inserted_at" | "slug">): string {
  const payload: CursorPayload = {
    insertedAt: row.inserted_at,
    slug: row.slug,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(token: string): CursorPayload {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as CursorPayload | null;

    if (!parsed || typeof parsed.insertedAt !== "string" || typeof parsed.slug !== "string") {
      throw new Error("Cursor payload malformed");
    }

    if (Number.isNaN(Date.parse(parsed.insertedAt))) {
      throw new Error("Cursor timestamp invalid");
    }

    if (!parsed.slug.trim()) {
      throw new Error("Cursor slug missing");
    }

    return parsed;
  } catch (error) {
    if (error instanceof BlogCursorError) {
      throw error;
    }

    throw new BlogCursorError("Invalid cursor");
  }
}

function mapRowToSummary(row: PostsTableRow): BlogPostSummary {
  return {
    slug: row.slug,
    fileSlug: row.slug,
    filePath: `blog/${row.slug}.mdx`,
    title: row.title,
    description: row.description,
    date: row.date,
    tags: row.tags ?? undefined,
  } satisfies BlogPostSummary;
}

async function loadCommentCounts(
  supabase: ReturnType<typeof getSupabase>,
  slugs: string[],
): Promise<Record<string, number> | null> {
  // Always return a full mapping for the given slugs (zero when absent).
  const zeroed = Object.fromEntries(slugs.map((s) => [s, 0]));
  if (slugs.length === 0) return zeroed;

  // 1) First, try the fast path (optional view). If it exists, great.
  try {
    const { data, error } = await supabase
      .from("post_comment_counts")
      .select("slug,approved_count")
      .in("slug", slugs);

    if (error) throw error;

    const counts = { ...zeroed };
    for (const row of (data ?? []) as Array<{ slug: string; approved_count: number }>) {
      if (typeof row.approved_count === "number") {
        counts[row.slug] = row.approved_count;
      }
    }
    return counts;
  } catch {
    // Fall through to the plain comments tally (no view required).
  }

  // 2) Fallback: fetch comments for these slugs and tally in-process.
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("slug")
      .in("slug", slugs);

    if (error) throw error;

    const counts = { ...zeroed };
    for (const row of (data ?? []) as Array<{ slug: string }>) {
      if (counts[row.slug] !== undefined) counts[row.slug] += 1;
    }
    return counts;
  } catch (error) {
    console.error("Failed to load comment counts (fallback) from Supabase:", error);
    // Final fallback: hide counts rather than crash the page.
    return null;
  }
}

function hasSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}

type BlogCacheSource = "supabase" | "fallback" | "fallback-error";

function logBlogCacheUsage(
  source: BlogCacheSource,
  options: BlogIndexPageOptions,
  page: BlogIndexPageResult,
) {
  try {
    const slugTags = Array.from(new Set(page.items.map((item) => getBlogPostCacheTag(item.slug))));

    const payload = {
      event: "blog-cache-hint",
      source,
      revalidate: BLOG_INDEX_REVALIDATE_SECONDS,
      tags: [BLOG_LIST_CACHE_TAG, ...slugTags],
      cursor: {
        after: options.after ?? null,
        before: options.before ?? null,
      },
      itemCount: page.items.length,
    } as const;

    console.info(JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to emit blog cache hint:", error);
  }
}

async function fetchFromSupabase(options: BlogIndexPageOptions): Promise<BlogIndexPageResult> {
  const pageSize = clampPageSize(options.pageSize);

  if (options.after && options.before) {
    throw new BlogCursorError("Only one cursor may be supplied at a time");
  }

  const supabase = getSupabase();
  const limit = pageSize + 1; // fetch one extra to detect if there is another page
  const columns = "slug,title,description,date,tags,inserted_at";

  const afterCursor = options.after ? decodeCursor(options.after) : null;
  const beforeCursor = options.before ? decodeCursor(options.before) : null;

  if (beforeCursor) {
    const filter = `inserted_at.gt.${beforeCursor.insertedAt},and(inserted_at.eq.${beforeCursor.insertedAt},slug.gt.${beforeCursor.slug})`;

    const { data, error } = await supabase
      .from("posts")
      .select(columns)
      .or(filter)
      .is("draft", false)
      .order("inserted_at", { ascending: true })
      .order("slug", { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    let rows = (data ?? []) as PostsTableRow[];
    rows = rows.filter((row) => {
      if (row.inserted_at > beforeCursor.insertedAt) {
        return true;
      }

      if (row.inserted_at === beforeCursor.insertedAt) {
        return row.slug > beforeCursor.slug;
      }

      return false;
    });

    const hasMoreNewer = rows.length > pageSize;
    const ascendingRows = sortRowsAscending(rows);
    const limited = ascendingRows.slice(0, pageSize);
    const reversed = [...limited].reverse(); // because we queried ascending

    const items = reversed.map(mapRowToSummary);
    const commentCounts = await loadCommentCounts(
      supabase,
      items.map((item) => item.slug),
    );
    const prevCursor = hasMoreNewer && reversed.length > 0 ? encodeCursor(reversed[0]) : null;
    const nextCursor = reversed.length > 0 ? encodeCursor(reversed[reversed.length - 1]) : null;

    return {
      items,
      nextCursor,
      prevCursor,
      commentCounts,
    } satisfies BlogIndexPageResult;
  }

  let query = supabase
    .from("posts")
    .select(columns)
    .is("draft", false)
    .order("inserted_at", { ascending: false })
    .order("slug", { ascending: false });

  if (afterCursor) {
    const filter = `inserted_at.lt.${afterCursor.insertedAt},and(inserted_at.eq.${afterCursor.insertedAt},slug.lt.${afterCursor.slug})`;
    query = query.or(filter);
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    throw error;
  }

  let rows = (data ?? []) as PostsTableRow[];
  if (afterCursor) {
    rows = rows.filter((row) => {
      if (row.inserted_at < afterCursor.insertedAt) {
        return true;
      }

      if (row.inserted_at === afterCursor.insertedAt) {
        return row.slug < afterCursor.slug;
      }

      return false;
    });
  }

  const hasMoreOlder = rows.length > pageSize;
  const descendingRows = sortFallbackRows(rows);
  const limited = descendingRows.slice(0, pageSize);

  const items = limited.map(mapRowToSummary);
  const commentCounts = await loadCommentCounts(
    supabase,
    items.map((item) => item.slug),
  );
  const nextCursor = hasMoreOlder && limited.length > 0 ? encodeCursor(limited[limited.length - 1]) : null;
  const prevCursor = afterCursor && limited.length > 0 ? encodeCursor(limited[0]) : null;

  return {
    items,
    nextCursor,
    prevCursor,
    commentCounts,
  } satisfies BlogIndexPageResult;
}

const cachedFetchFromSupabase = unstable_cache(
  async (options: BlogIndexPageOptions) => fetchFromSupabase(options),
  ["supabase-blog-index"],
  { revalidate: BLOG_INDEX_REVALIDATE_SECONDS, tags: [BLOG_LIST_CACHE_TAG] },
);

function sortFallbackRows(rows: PostsTableRow[]) {
  return [...rows].sort((a, b) => {
    const left = Date.parse(a.inserted_at);
    const right = Date.parse(b.inserted_at);
    if (left !== right) {
      return right - left;
    }

    return b.slug.localeCompare(a.slug);
  });
}

function sortRowsAscending(rows: PostsTableRow[]) {
  return [...rows].sort((a, b) => {
    const left = Date.parse(a.inserted_at);
    const right = Date.parse(b.inserted_at);
    if (left !== right) {
      return left - right;
    }

    return a.slug.localeCompare(b.slug);
  });
}

async function fetchFromFallback(options: BlogIndexPageOptions): Promise<BlogIndexPageResult> {
  const pageSize = clampPageSize(options.pageSize);

  if (options.after && options.before) {
    throw new BlogCursorError("Only one cursor may be supplied at a time");
  }

  const posts = await getBlogPostSummaries();
  const rows = sortFallbackRows(
    posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags ?? null,
      inserted_at: post.date,
    } satisfies PostsTableRow)),
  );

  const afterCursor = options.after ? decodeCursor(options.after) : null;
  const beforeCursor = options.before ? decodeCursor(options.before) : null;

  if (beforeCursor) {
    const filtered = rows.filter((row) => {
      if (row.inserted_at > beforeCursor.insertedAt) {
        return true;
      }

      if (row.inserted_at === beforeCursor.insertedAt) {
        return row.slug > beforeCursor.slug;
      }

      return false;
    });

    const hasMoreNewer = filtered.length > pageSize;
    const ascending = sortRowsAscending(filtered);
    const limited = ascending.slice(0, pageSize);
    const reversed = [...limited].reverse();

    const items = reversed.map(mapRowToSummary);
    const prevCursor = hasMoreNewer && reversed.length > 0 ? encodeCursor(reversed[0]) : null;
    const nextCursor = reversed.length > 0 ? encodeCursor(reversed[reversed.length - 1]) : null;

    return {
      items,
      nextCursor,
      prevCursor,
      commentCounts: null,
    } satisfies BlogIndexPageResult;
  }

  const filtered = afterCursor
    ? rows.filter((row) => {
        if (row.inserted_at < afterCursor.insertedAt) {
          return true;
        }

        if (row.inserted_at === afterCursor.insertedAt) {
          return row.slug < afterCursor.slug;
        }

        return false;
      })
    : rows;

  const hasMoreOlder = filtered.length > pageSize;
  const limited = filtered.slice(0, pageSize);
  const items = limited.map(mapRowToSummary);
  const nextCursor = hasMoreOlder && limited.length > 0 ? encodeCursor(limited[limited.length - 1]) : null;
  const prevCursor = afterCursor && limited.length > 0 ? encodeCursor(limited[0]) : null;

  return {
    items,
    nextCursor,
    prevCursor,
    commentCounts: null,
  } satisfies BlogIndexPageResult;
}

export async function getBlogIndexPage(options: BlogIndexPageOptions): Promise<BlogIndexPageResult> {
  const forceFallback = process.env.BLOG_INDEX_FORCE_FALLBACK === "1";
  if (forceFallback || !hasSupabaseConfig()) {
    const page = await fetchFromFallback(options);
    logBlogCacheUsage("fallback", options, page);
    return page;
  }

  try {
    const page = await cachedFetchFromSupabase(options);
    logBlogCacheUsage("supabase", options, page);
    return page;
  } catch (error) {
    if (error instanceof BlogCursorError) {
      throw error;
    }

    console.error("Failed to load blog index from Supabase, falling back to static content:", error);
    const fallbackPage = await fetchFromFallback(options);
    logBlogCacheUsage("fallback-error", options, fallbackPage);
    return fallbackPage;
  }
}

export function createCursorHref(basePath: string, param: typeof BLOG_AFTER_PARAM | typeof BLOG_BEFORE_PARAM, cursor: string) {
  const params = new URLSearchParams();
  params.set(param, cursor);
  return `${basePath}?${params.toString()}`;
}

export function parseCursorParam(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  const resolved = Array.isArray(value) ? value[0] : value;
  const trimmed = resolved?.trim();
  return trimmed ? trimmed : null;
}
