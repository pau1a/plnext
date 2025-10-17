import crypto from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const supabaseInsert = vi.fn();
  const supabaseFrom = vi.fn();
  const rateLimitMock = vi.fn();
  const getServiceSupabase = vi.fn();

  return {
    supabaseInsert,
    supabaseFrom,
    rateLimitMock,
    getServiceSupabase,
  };
});

vi.mock("@/lib/supabase/service", () => ({
  getServiceSupabase: mocks.getServiceSupabase.mockImplementation(() => ({
    from: mocks.supabaseFrom,
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceContactRateLimits: mocks.rateLimitMock,
}));

describe("/api/contact", () => {
  const { supabaseInsert, supabaseFrom, rateLimitMock, getServiceSupabase } = mocks;

  const queryBuilder = {
    insert: supabaseInsert,
  } as const;

  beforeEach(() => {
    supabaseInsert.mockReset();
    supabaseFrom.mockReset();
    rateLimitMock.mockReset();
    getServiceSupabase.mockReset();

    supabaseFrom.mockReturnValue(queryBuilder);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function loadRoute() {
    return import("@/app/api/contact/route");
  }

  function buildRequest(body: Record<string, unknown>) {
    return new Request("https://example.com/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.42",
        "user-agent": "vitest",
      },
      body: JSON.stringify(body),
    });
  }

  it("accepts valid submissions", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: true, remaining: 2, reset: Date.now(), limit: 3 },
      email: { success: true, remaining: 2, reset: Date.now(), limit: 3 },
    });
    supabaseInsert.mockResolvedValue({ error: null });

    const { POST } = await loadRoute();

    const submittedAt = new Date(Date.now() - 5_000).toISOString();
    const request = buildRequest({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello!",
      honeypot: "",
      submittedAt,
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBeTruthy();

    const body = await response.json();
    expect(body).toEqual({ success: true });

    const expectedIpHash = crypto.createHash("sha256").update("203.0.113.42").digest("hex");
    const expectedEmailHash = crypto.createHash("sha256").update("ada@example.com").digest("hex");

    expect(rateLimitMock).toHaveBeenCalledWith({
      ipHash: expectedIpHash,
      emailHash: expectedEmailHash,
    });
    expect(supabaseFrom).toHaveBeenCalledWith("contact_messages");
    expect(supabaseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello!",
        ip_hash: expectedIpHash,
      }),
    );
  });

  it("rejects invalid payloads", async () => {
    const { POST } = await loadRoute();

    const request = buildRequest({
      name: "",
      email: "not-an-email",
      message: "",
      honeypot: "",
      submittedAt: new Date(Date.now() - 5_000).toISOString(),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const payload = await response.json();
    expect(payload.error).toBeTruthy();
    expect(rateLimitMock).not.toHaveBeenCalled();
    expect(supabaseInsert).not.toHaveBeenCalled();
  });

  it("blocks honeypot submissions", async () => {
    const { POST } = await loadRoute();
    const request = buildRequest({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      honeypot: "bot", // fails validation
      submittedAt: new Date(Date.now() - 5_000).toISOString(),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(rateLimitMock).not.toHaveBeenCalled();
  });

  it("enforces dwell time", async () => {
    const { POST } = await loadRoute();
    const request = buildRequest({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      honeypot: "",
      submittedAt: new Date().toISOString(),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(rateLimitMock).not.toHaveBeenCalled();
    const payload = await response.json();
    expect(payload.error).toMatch(/quickly/i);
  });

  it("returns 429 when rate limited", async () => {
    rateLimitMock.mockResolvedValue({
      ip: { success: false, remaining: 0, reset: Date.now(), limit: 3 },
      email: { success: true, remaining: 2, reset: Date.now(), limit: 3 },
    });

    const { POST } = await loadRoute();
    const request = buildRequest({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      honeypot: "",
      submittedAt: new Date(Date.now() - 5_000).toISOString(),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const payload = await response.json();
    expect(payload.error).toMatch(/rate limit/i);
    expect(supabaseInsert).not.toHaveBeenCalled();
  });
});
