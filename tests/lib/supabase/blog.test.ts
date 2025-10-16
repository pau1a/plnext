import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

    const secondPage = await blog.getBlogIndexPage({
      pageSize: 2,
      after: firstPage.nextCursor,
    });

    expect(secondPage.items.map((item) => item.slug)).toEqual(["bravo"]);
    expect(secondPage.prevCursor).not.toBeNull();
    expect(secondPage.nextCursor).toBeNull();
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

    const previous = await blog.getBlogIndexPage({
      pageSize: 2,
      before: nextPage.prevCursor,
    });

    expect(previous.items.map((item) => item.slug)).toEqual(["first", "second"]);
    expect(previous.prevCursor).toBeNull();
    expect(previous.nextCursor).not.toBeNull();
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
  });

  it("applies tie-breaker filters for after/prev navigation", async () => {
    const limitResponses: Array<{ data: Array<{
      slug: string;
      title: string;
      description: string;
      date: string;
      tags: string[] | null;
      inserted_at: string;
    }>; error: null }> = [];

    const builders: Array<{
      select: ReturnType<typeof vi.fn>;
      or: ReturnType<typeof vi.fn>;
      order: ReturnType<typeof vi.fn>;
      limit: ReturnType<typeof vi.fn>;
    }> = [];

    function createBuilder() {
      const select = vi.fn().mockReturnThis();
      const or = vi.fn().mockReturnThis();
      const order = vi.fn().mockReturnThis();
      const limit = vi
        .fn()
        .mockImplementation(() => Promise.resolve(limitResponses.shift() ?? { data: [], error: null }));

      const builder = { select, or, order, limit };
      builders.push(builder);
      return builder;
    }

    const from = vi.fn(() => createBuilder());

    vi.doMock("@/lib/supabase/server", () => ({
      getSupabase: () => ({ from }),
    }));

    const blog = await import("@/lib/supabase/blog");

    limitResponses.push({
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

    const firstPage = await blog.getBlogIndexPage({ pageSize: 1 });
    expect(firstPage.items.map((item) => item.slug)).toEqual(["alpha"]);
    expect(firstPage.nextCursor).not.toBeNull();
    expect(builders[0].select).toHaveBeenCalledWith("slug,title,description,date,tags,inserted_at");
    expect(builders[0].or).not.toHaveBeenCalled();

    limitResponses.push({
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

    const secondPage = await blog.getBlogIndexPage({ pageSize: 1, after: firstPage.nextCursor });
    expect(builders[1].or).toHaveBeenCalledWith(
      expect.stringContaining("inserted_at.lt"),
    );
    expect(secondPage.items.map((item) => item.slug)).toEqual(["beta"]);

    limitResponses.push({
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

    const previousPage = await blog.getBlogIndexPage({ pageSize: 1, before: secondPage.prevCursor });
    expect(builders[2].or).toHaveBeenCalledWith(
      expect.stringContaining("inserted_at.gt"),
    );
    expect(previousPage.items.map((item) => item.slug)).toEqual(["alpha"]);

    vi.doUnmock("@/lib/supabase/server");
  });
});
