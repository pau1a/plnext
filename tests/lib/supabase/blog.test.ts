import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache:
    <Args extends unknown[], Return>(
      fn: (...args: Args) => Promise<Return>,
      key: unknown,
      options: unknown,
    ) => {
      void key;
      void options;
      return (...args: Args) => fn(...args);
    },
}));

import type { BlogPostSummary } from "@/lib/mdx";

function buildSummary(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
  return {
    slug: "example-post",
    title: "Example",
    description: "Example description",
    date: "2025-01-01T00:00:00.000Z",
    tags: ["example"],
    ...overrides,
  } satisfies BlogPostSummary;
}

describe("getBlogIndexPage (fallback)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BLOG_INDEX_FORCE_FALLBACK = "1";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    delete process.env.BLOG_INDEX_FORCE_FALLBACK;
  });

  it("orders posts by inserted_at and slug with forward navigation", async () => {
    const summaries: BlogPostSummary[] = [
      buildSummary({ slug: "charlie", date: "2024-02-01T10:00:00.000Z" }),
      buildSummary({ slug: "alpha", date: "2024-02-01T10:00:00.000Z" }),
      buildSummary({ slug: "bravo", date: "2024-01-01T10:00:00.000Z" }),
    ];

    const mdx = await import("@/lib/mdx");
    vi.spyOn(mdx, "getBlogPostSummaries").mockResolvedValue(summaries);

    const blog = await import("@/lib/supabase/blog");

    const firstPage = await blog.getBlogIndexPage({ pageSize: 2 });
    expect(firstPage.items.map((item) => item.slug)).toEqual(["charlie", "alpha"]);
    expect(firstPage.prevCursor).toBeNull();
    expect(firstPage.nextCursor).not.toBeNull();
    expect(firstPage.commentCounts).toBeNull();

    const secondPage = await blog.getBlogIndexPage({
      pageSize: 2,
      after: firstPage.nextCursor,
    });

    expect(secondPage.items.map((item) => item.slug)).toEqual(["bravo"]);
    expect(secondPage.prevCursor).not.toBeNull();
    expect(secondPage.nextCursor).toBeNull();
    expect(secondPage.commentCounts).toBeNull();
  });

  it("supports backward navigation via before cursor", async () => {
    const summaries: BlogPostSummary[] = [
      buildSummary({ slug: "first", date: "2024-04-01T00:00:00.000Z" }),
      buildSummary({ slug: "second", date: "2024-03-01T00:00:00.000Z" }),
      buildSummary({ slug: "third", date: "2024-02-01T00:00:00.000Z" }),
      buildSummary({ slug: "fourth", date: "2024-01-01T00:00:00.000Z" }),
    ];

    const mdx = await import("@/lib/mdx");
    vi.spyOn(mdx, "getBlogPostSummaries").mockResolvedValue(summaries);

    const blog = await import("@/lib/supabase/blog");

    const firstPage = await blog.getBlogIndexPage({ pageSize: 2 });
    const nextPage = await blog.getBlogIndexPage({ pageSize: 2, after: firstPage.nextCursor });

    expect(nextPage.items.map((item) => item.slug)).toEqual(["third", "fourth"]);
    expect(nextPage.prevCursor).not.toBeNull();
    expect(nextPage.commentCounts).toBeNull();

    const previous = await blog.getBlogIndexPage({
      pageSize: 2,
      before: nextPage.prevCursor,
    });

    expect(previous.items.map((item) => item.slug)).toEqual(["first", "second"]);
    expect(previous.prevCursor).toBeNull();
    expect(previous.nextCursor).not.toBeNull();
    expect(previous.commentCounts).toBeNull();
  });

  it("throws for malformed cursor tokens", async () => {
    const mdx = await import("@/lib/mdx");
    vi.spyOn(mdx, "getBlogPostSummaries").mockResolvedValue([buildSummary()]);

    const blog = await import("@/lib/supabase/blog");

    await expect(blog.getBlogIndexPage({ pageSize: 2, after: "not-valid" })).rejects.toThrow(
      blog.BlogCursorError,
    );
  });
});

describe("getBlogIndexPage (supabase)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BLOG_INDEX_FORCE_FALLBACK = "0";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
  });

  afterEach(() => {
    delete process.env.BLOG_INDEX_FORCE_FALLBACK;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    vi.doUnmock("@/lib/supabase/server");
  });

  function setupSupabaseMock() {
    const postResponses: Array<{
      data: Array<{
        slug: string;
        title: string;
        description: string;
        date: string;
        tags: string[] | null;
        inserted_at: string;
      }>;
      error: Error | null;
    }> = [];
    const countResponses: Array<{
      data: Array<{ slug: string; approved_count: number }> | null;
      error: Error | null;
    }> = [];
    const commentResponses: Array<{
      data: Array<{ slug: string }> | null;
      error: Error | null;
    }> = [];

    const postBuilders: Array<{
      select: ReturnType<typeof vi.fn>;
      or: ReturnType<typeof vi.fn>;
      order: ReturnType<typeof vi.fn>;
      limit: ReturnType<typeof vi.fn>;
    }> = [];
    const countBuilders: Array<{
      select: ReturnType<typeof vi.fn>;
      in: ReturnType<typeof vi.fn>;
    }> = [];
    const commentBuilders: Array<{
      select: ReturnType<typeof vi.fn>;
      in: ReturnType<typeof vi.fn>;
    }> = [];

    function createPostBuilder() {
      const select = vi.fn().mockReturnThis();
      const or = vi.fn().mockReturnThis();
      const order = vi.fn().mockReturnThis();
      const limit = vi
        .fn()
        .mockImplementation(() => Promise.resolve(postResponses.shift() ?? { data: [], error: null }));

      const builder = { select, or, order, limit };
      postBuilders.push(builder);
      return builder;
    }

    function createCountBuilder() {
      const select = vi.fn().mockReturnThis();
      const inOperator = vi
        .fn()
        .mockImplementation(() => Promise.resolve(countResponses.shift() ?? { data: [], error: null }));

      const builder = { select, in: inOperator };
      countBuilders.push(builder);
      return builder;
    }

    function createCommentBuilder() {
      const select = vi.fn().mockReturnThis();
      const inOperator = vi
        .fn()
        .mockImplementation(() => Promise.resolve(commentResponses.shift() ?? { data: [], error: null }));

      const builder = { select, in: inOperator };
      commentBuilders.push(builder);
      return builder;
    }

    const from = vi.fn((table: string) => {
      if (table === "posts") {
        return createPostBuilder();
      }
      if (table === "post_comment_counts") {
        return createCountBuilder();
      }
      if (table === "comments") {
        return createCommentBuilder();
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    vi.doMock("@/lib/supabase/server", () => ({
      getSupabase: () => ({ from }),
    }));

    return { postResponses, countResponses, commentResponses, postBuilders, countBuilders, commentBuilders };
  }

  it("applies tie-breaker filters for after/prev navigation", async () => {
    const { postResponses, countResponses, postBuilders, countBuilders } = setupSupabaseMock();

    const blog = await import("@/lib/supabase/blog");

    postResponses.push({
      data: [
        {
          slug: "alpha",
          title: "Alpha",
          description: "",
          date: "2024-04-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-04-10T10:00:00.000Z",
        },
        {
          slug: "beta",
          title: "Beta",
          description: "",
          date: "2024-03-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-03-10T10:00:00.000Z",
        },
      ],
      error: null,
    });
    countResponses.push({
      data: [
        {
          slug: "alpha",
          approved_count: 3,
        },
      ],
      error: null,
    });

    const firstPage = await blog.getBlogIndexPage({ pageSize: 1 });
    expect(firstPage.items.map((item) => item.slug)).toEqual(["alpha"]);
    expect(firstPage.nextCursor).not.toBeNull();
    expect(firstPage.commentCounts).toEqual({ alpha: 3 });
    expect(postBuilders[0].select).toHaveBeenCalledWith("slug,title,description,date,tags,inserted_at");
    expect(postBuilders[0].or).not.toHaveBeenCalled();
    expect(countBuilders[0].select).toHaveBeenCalledWith("slug,approved_count");
    expect(countBuilders[0].in).toHaveBeenCalledWith("slug", ["alpha"]);

    postResponses.push({
      data: [
        {
          slug: "beta",
          title: "Beta",
          description: "",
          date: "2024-03-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-03-10T10:00:00.000Z",
        },
        {
          slug: "gamma",
          title: "Gamma",
          description: "",
          date: "2024-02-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-02-10T10:00:00.000Z",
        },
      ],
      error: null,
    });
    countResponses.push({
      data: [],
      error: null,
    });

    const secondPage = await blog.getBlogIndexPage({ pageSize: 1, after: firstPage.nextCursor });
    expect(postBuilders[1].or).toHaveBeenCalledWith(expect.stringContaining("inserted_at.lt"));
    expect(secondPage.items.map((item) => item.slug)).toEqual(["beta"]);
    expect(secondPage.commentCounts).toEqual({ beta: 0 });

    postResponses.push({
      data: [
        {
          slug: "alpha",
          title: "Alpha",
          description: "",
          date: "2024-04-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-04-10T10:00:00.000Z",
        },
      ],
      error: null,
    });
    countResponses.push({
      data: [
        {
          slug: "alpha",
          approved_count: 3,
        },
      ],
      error: null,
    });

    const previousPage = await blog.getBlogIndexPage({ pageSize: 1, before: secondPage.prevCursor });
    expect(postBuilders[2].or).toHaveBeenCalledWith(expect.stringContaining("inserted_at.gt"));
    expect(previousPage.items.map((item) => item.slug)).toEqual(["alpha"]);
    expect(previousPage.commentCounts).toEqual({ alpha: 3 });
  });

  it("suppresses comment counts when Supabase lookup fails", async () => {
    const { postResponses, countResponses, commentResponses } = setupSupabaseMock();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const blog = await import("@/lib/supabase/blog");

    const failure = new Error("boom");
    const fallbackFailure = new Error("Unexpected table: comments");

    postResponses.push({
      data: [
        {
          slug: "alpha",
          title: "Alpha",
          description: "",
          date: "2024-04-01T00:00:00.000Z",
          tags: null,
          inserted_at: "2024-04-10T10:00:00.000Z",
        },
      ],
      error: null,
    });
    countResponses.push({ data: null, error: failure });
    commentResponses.push({ data: null, error: fallbackFailure });

    const page = await blog.getBlogIndexPage({ pageSize: 1 });

    expect(page.commentCounts).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load comment counts (fallback) from Supabase:",
      fallbackFailure,
    );

    consoleSpy.mockRestore();
  });
});
