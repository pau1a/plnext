import crypto from "node:crypto";

import sanitizeHtml from "sanitize-html";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";

import { enforceCommentRateLimits } from "@/lib/rate-limit";
import { getSupabase, type CommentsTableInsert } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PAGE_SIZE = 20;
const MIN_DWELL_TIME_MS = 3_000;

const commentPayloadSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(128, "Slug is too long")
      .regex(/^[a-z0-9\-_/]+$/i, "Slug contains invalid characters"),
    author: z
      .string()
      .trim()
      .min(1, "Author is required")
      .max(80, "Author is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(320, "Email is too long")
      .email("Email is invalid"),
    body: z
      .string()
      .trim()
      .min(1, "Body is required")
      .max(2_000, "Body is too long"),
    honeypot: z.string().optional().transform((value) => value?.trim() ?? ""),
    submittedAt: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "submittedAt must be an ISO timestamp",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.honeypot && data.honeypot.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Honeypot must be empty",
        path: ["honeypot"],
      });
    }
  });

function sanitizeCommentBody(raw: string): string {
  const clean = sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();

  return clean;
}

function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "0.0.0.0";
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function logStructured(data: Record<string, unknown>) {
  console.log(JSON.stringify(data));
}

function serializeSupabaseError(error: unknown) {
  const fallbackMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

  if (error && typeof error === "object") {
    const typed = error as PostgrestError & {
      details?: string | null;
      hint?: string | null;
      code?: string | null;
    };

    return {
      message: typed.message ?? fallbackMessage,
      details: typed.details ?? null,
      hint: typed.hint ?? null,
      code: typed.code ?? null,
    };
  }

  return {
    message: fallbackMessage,
    details: null,
    hint: null,
    code: null,
  };
}

function parseAfterCursor(after: string | null): string | null {
  if (!after) {
    return null;
  }

  const trimmed = after.trim();
  if (!trimmed) {
    return null;
  }

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) {
    throw new Error("Invalid cursor");
  }

  return new Date(timestamp).toISOString();
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const afterParam = url.searchParams.get("after");

  if (!slug) {
    const response = NextResponse.json(
      { error: "Missing required slug parameter" },
      { status: 400 },
    );
    response.headers.set("x-request-id", requestId);
    return response;
  }

  let after: string | null = null;
  try {
    after = parseAfterCursor(afterParam);
  } catch (error) {
    const response = NextResponse.json(
      { error: "Invalid after cursor" },
      { status: 400 },
    );
    response.headers.set("x-request-id", requestId);
    return response;
  }

  try {
    const supabase = getSupabase();
    const query = supabase
      .from("comments")
      .select("id, slug, author, content, created_at")
      .eq("slug", slug)
      .order("created_at", { ascending: true });

    const limitedQuery = after ? query.gt("created_at", after) : query;
    const { data, error } = await limitedQuery.limit(PAGE_SIZE + 1);

    if (error) {
      throw error;
    }

    const hasMore = (data?.length ?? 0) > PAGE_SIZE;
    const records = (data ?? []).slice(0, PAGE_SIZE);

    const response = NextResponse.json(
      {
        comments: records.map((row) => ({
          id: row.id,
          author: row.author,
          body: row.content,
          createdAt: row.created_at,
        })),
        nextCursor: hasMore ? records[records.length - 1]?.created_at ?? null : null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      },
    );

    response.headers.set("x-request-id", requestId);

    logStructured({
      level: "info",
      event: "comments.get.success",
      requestId,
      slug,
      count: records.length,
      hasMore,
    });

    return response;
  } catch (error) {
    const serialized = serializeSupabaseError(error);

    console.error("GET /api/comments failed:", error);
    logStructured({
      level: "error",
      event: "comments.get.failure",
      requestId,
      slug,
      message: serialized.message,
      details: serialized.details,
      hint: serialized.hint,
      code: serialized.code,
    });

    const response = NextResponse.json(
      {
        error: serialized.message,
        details: serialized.details,
        hint: serialized.hint,
        code: serialized.code,
      },
      { status: 500 },
    );
    response.headers.set("x-request-id", requestId);
    return response;
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  let parsedBody: z.infer<typeof commentPayloadSchema> | null = null;

  try {
    const json = await request.json();
    parsedBody = commentPayloadSchema.parse(json);
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid payload" : "Invalid JSON";

    logStructured({
      level: "warn",
      event: "comments.post.validation_failed",
      requestId,
      ipHash,
      message,
    });

    const response = NextResponse.json({ error: message }, { status: 400 });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const dwellTime = Date.now() - new Date(parsedBody.submittedAt).getTime();
  if (Number.isNaN(dwellTime) || dwellTime < MIN_DWELL_TIME_MS) {
    const response = NextResponse.json(
      { error: "Form submitted too quickly" },
      { status: 400 },
    );
    response.headers.set("x-request-id", requestId);

    logStructured({
      level: "warn",
      event: "comments.post.dwell_time_failed",
      requestId,
      ipHash,
      dwellTime,
    });

    return response;
  }

  const sanitizedBody = sanitizeCommentBody(parsedBody.body);
  if (!sanitizedBody) {
    const response = NextResponse.json(
      { error: "Comment body is empty after sanitisation" },
      { status: 400 },
    );
    response.headers.set("x-request-id", requestId);

    logStructured({
      level: "warn",
      event: "comments.post.sanitization_failed",
      requestId,
      ipHash,
    });

    return response;
  }

  const rateLimits = await enforceCommentRateLimits({
    ipHash,
    slug: parsedBody.slug,
  });

  if (!rateLimits.ip.success || !rateLimits.slug.success) {
    const response = NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 },
    );
    response.headers.set("x-request-id", requestId);

    logStructured({
      level: "warn",
      event: "comments.post.rate_limited",
      requestId,
      ipHash,
      slug: parsedBody.slug,
      remainingIp: rateLimits.ip.remaining,
      remainingSlug: rateLimits.slug.remaining,
    });

    return response;
  }

  try {
    const supabase = getSupabase();
    const payload: CommentsTableInsert = {
      slug: parsedBody.slug,
      author: parsedBody.author,
      content: sanitizedBody,
    };

    const { error } = await supabase.from("comments").insert(payload);
    if (error) {
      throw error;
    }

    const response = NextResponse.json(
      { success: true },
      { status: 201 },
    );
    response.headers.set("x-request-id", requestId);

    logStructured({
      level: "info",
      event: "comments.post.accepted",
      requestId,
      slug: parsedBody.slug,
      ipHash,
    });

    return response;
  } catch (error) {
    const serialized = serializeSupabaseError(error);

    console.error("POST /api/comments failed:", error);
    logStructured({
      level: "error",
      event: "comments.post.failure",
      requestId,
      slug: parsedBody.slug,
      ipHash,
      message: serialized.message,
      details: serialized.details,
      hint: serialized.hint,
      code: serialized.code,
    });

    const response = NextResponse.json(
      {
        error: serialized.message,
        details: serialized.details,
        hint: serialized.hint,
        code: serialized.code,
      },
      { status: 500 },
    );
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
