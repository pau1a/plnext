import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";

import { enforceContactRateLimits } from "@/lib/rate-limit";
import { getServiceSupabase, type ContactMessageInsert } from "@/lib/supabase/service";

export const runtime = "nodejs";

const MIN_DWELL_TIME_MS = 3_000;

const contactPayloadSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(320, "Email is too long")
      .email("Email is invalid"),
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(2_000, "Message is too long"),
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

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
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

function withCommonHeaders(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const ip = getClientIp(request);
  const ipHash = hashValue(ip);
  let parsedBody: z.infer<typeof contactPayloadSchema> | null = null;

  try {
    const json = await request.json();
    parsedBody = contactPayloadSchema.parse(json);
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid payload" : "Invalid JSON";

    logStructured({
      level: "warn",
      event: "contact.post.validation_failed",
      requestId,
      ipHash,
      message,
    });

    return withCommonHeaders(NextResponse.json({ error: message }, { status: 400 }), requestId);
  }

  const dwellTime = Date.now() - new Date(parsedBody.submittedAt).getTime();
  if (Number.isNaN(dwellTime) || dwellTime < MIN_DWELL_TIME_MS) {
    logStructured({
      level: "warn",
      event: "contact.post.dwell_time_failed",
      requestId,
      ipHash,
      dwellTime,
    });

    return withCommonHeaders(
      NextResponse.json({ error: "Form submitted too quickly" }, { status: 400 }),
      requestId,
    );
  }

  const normalizedEmail = parsedBody.email.toLowerCase();
  const emailHash = hashValue(normalizedEmail);

  const rateLimits = await enforceContactRateLimits({ ipHash, emailHash });

  if (!rateLimits.ip.success || !rateLimits.email.success) {
    logStructured({
      level: "warn",
      event: "contact.post.rate_limited",
      requestId,
      ipHash,
      remainingIp: rateLimits.ip.remaining,
      remainingEmail: rateLimits.email.remaining,
    });

    return withCommonHeaders(
      NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }),
      requestId,
    );
  }

  try {
    const supabase = getServiceSupabase();
    const payload: ContactMessageInsert = {
      name: parsedBody.name,
      email: parsedBody.email,
      message: parsedBody.message,
      ip_hash: ipHash,
      user_agent: request.headers.get("user-agent"),
    };

    const { error } = await supabase
      .from("pl_site.contact_messages")
      .insert(payload);
    if (error) {
      throw error;
    }

    logStructured({
      level: "info",
      event: "contact.post.accepted",
      requestId,
      ipHash,
      emailHash,
    });

    return withCommonHeaders(NextResponse.json({ success: true }, { status: 201 }), requestId);
  } catch (error) {
    const serialized = serializeSupabaseError(error);

    console.error("POST /api/contact failed:", error);
    logStructured({
      level: "error",
      event: "contact.post.failure",
      requestId,
      ipHash,
      message: serialized.message,
      details: serialized.details,
      hint: serialized.hint,
      code: serialized.code,
    });

    return withCommonHeaders(
      NextResponse.json(
        {
          error: serialized.message,
          details: serialized.details,
          hint: serialized.hint,
          code: serialized.code,
        },
        { status: 500 },
      ),
      requestId,
    );
  }
}
