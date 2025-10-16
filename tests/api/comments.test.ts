import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const supabaseInsert = vi.fn();
  const supabaseSelect = vi.fn();
  const supabaseEq = vi.fn();
  const supabaseOrder = vi.fn();
  const supabaseGt = vi.fn();
  const supabaseLimit = vi.fn();
  const supabaseFrom = vi.fn();
  const rateLimitMock = vi.fn();

  return {
    supabaseInsert,
    supabaseSelect,
    supabaseEq,
    supabaseOrder,
    supabaseGt,
    supabaseLimit,
    supabaseFrom,
    rateLimitMock,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({
    from: mocks.supabaseFrom,
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceCommentRateLimits: mocks.rateLimitMock,
}));

describe("/api/comments", () => {
  const {
    supabaseInsert,
    supabaseSelect,
    supabaseEq,
    supabaseOrder,
    supabaseGt,
    supabaseLimit,
    supabaseFrom,
    rateLimitMock,
  } = mocks;

  const queryBuilder = {
    select: supabaseSelect,
    eq: supabaseEq,
    order: supabaseOrder,
    gt: supabaseGt,
    limit: supabaseLimit,
    insert: supabaseInsert,
  } as const;

  beforeEach(() => {
    supabaseInsert.mockReset();
    supabaseSelect.mockReset();
    supabaseEq.mockReset();
    supabaseOrder.mockReset();
    supabaseGt.mockReset();
    supabaseLimit.mockReset();
    supabaseFrom.mockReset();
    rateLimitMock.mockReset();

    supabaseFrom.mockReturnValue(queryBuilder);
    supabaseSelect.mockReturnValue(queryBuilder);
    supabaseEq.mockReturnValue(queryBuilder);
    supabaseOrder.mockReturnValue(queryBuilder);
    supabaseGt.mockReturnValue(queryBuilder);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function loadRoute() {
    return import("@/app/api/comments/route");
  }

  it("returns comments with pagination metadata", async () => {
    const now = new Date().toISOString();
    supabaseLimit.mockResolvedValue({
      data: [
        {
          id: "1",
          author_name: "Paula",
          body: "Great post!",
          created_at: now,
          status: "approved",
        },
      ],
      error: null,
    });

    const { GET } = await loadRoute();
    const request = new Request("https://example.com/api/comments?slug=hello-world");

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=600",
    );
    expect(payload).toEqual({
      comments: [
        {
          id: "1",
          author: "Paula",
          body: "Great post!",
          createdAt: now,
        },
      ],
      nextCursor: null,
    });

    expect(supabaseFrom).toHaveBeenCalledWith("comments");
    expect(supabaseSelect).toHaveBeenCalledWith("id, author_name, body, created_at");
  });

  it("rejects missing slug", async () => {
    const { GET } = await loadRoute();
    const request = new Request("https://example.com/api/comments");

    const response = await GET(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/slug/i);
  });

  it("rejects invalid cursor", async () => {
    const { GET } = await loadRoute();
    const request = new Request(
      "https://example.com/api/comments?slug=hello-world&after=not-a-date",
    );

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid comment submissions", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: true, remaining: 4, reset: Date.now(), limit: 5 },
      slug: { success: true, remaining: 29, reset: Date.now(), limit: 30 },
    });
    supabaseInsert.mockResolvedValue({ error: null });

    const { POST } = await loadRoute();

    const request = new Request("https://example.com/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify({
        slug: "hello-world",
        author: "Ada",
        email: "ada@example.com",
        body: "<strong>Love it!</strong>",
        honeypot: "",
        submittedAt: new Date(Date.now() - 10_000).toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual({ success: true });

    expect(supabaseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        post_slug: "hello-world",
        author_name: "Ada",
        author_email: "ada@example.com",
        body: "Love it!",
        status: "pending",
      }),
    );
    const inserted = supabaseInsert.mock.calls[0][0];
    expect(typeof inserted.ip_hash).toBe("string");
    expect(inserted.ip_hash).toHaveLength(64);
  });

  it("enforces honeypot validation", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: true, remaining: 4, reset: Date.now(), limit: 5 },
      slug: { success: true, remaining: 29, reset: Date.now(), limit: 30 },
    });

    const { POST } = await loadRoute();
    const request = new Request("https://example.com/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        slug: "hello-world",
        author: "Ada",
        email: "ada@example.com",
        body: "Test",
        honeypot: "robot",
        submittedAt: new Date(Date.now() - 10_000).toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/honeypot/i);
    expect(supabaseInsert).not.toHaveBeenCalled();
  });

  it("enforces dwell time", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: true, remaining: 4, reset: Date.now(), limit: 5 },
      slug: { success: true, remaining: 29, reset: Date.now(), limit: 30 },
    });

    const { POST } = await loadRoute();
    const request = new Request("https://example.com/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        slug: "hello-world",
        author: "Ada",
        email: "ada@example.com",
        body: "Test",
        honeypot: "",
        submittedAt: new Date().toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/quickly/i);
    expect(supabaseInsert).not.toHaveBeenCalled();
  });

  it("enforces rate limits", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: false, remaining: 0, reset: Date.now(), limit: 5 },
      slug: { success: true, remaining: 29, reset: Date.now(), limit: 30 },
    });

    const { POST } = await loadRoute();
    const request = new Request("https://example.com/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        slug: "hello-world",
        author: "Ada",
        email: "ada@example.com",
        body: "Test",
        honeypot: "",
        submittedAt: new Date(Date.now() - 10_000).toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(supabaseInsert).not.toHaveBeenCalled();
  });

  it("handles Supabase insertion failures", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: true, remaining: 4, reset: Date.now(), limit: 5 },
      slug: { success: true, remaining: 29, reset: Date.now(), limit: 30 },
    });
    supabaseInsert.mockResolvedValue({ error: new Error("insert failed") });

    const { POST } = await loadRoute();
    const request = new Request("https://example.com/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        slug: "hello-world",
        author: "Ada",
        email: "ada@example.com",
        body: "Test",
        honeypot: "",
        submittedAt: new Date(Date.now() - 10_000).toISOString(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
