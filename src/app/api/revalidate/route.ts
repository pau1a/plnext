import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { BLOG_LIST_CACHE_TAG, getBlogPostCacheTag } from "@/lib/supabase/blog";

export const runtime = "nodejs";

const TOKEN_ENV_KEY = "ADMIN_REVALIDATE_TOKEN";
const slugPattern = /^[a-z0-9][a-z0-9-]*$/i;

function resolveBearerToken(headerValue: string | null): string | null {
  if (!headerValue) {
    return null;
  }

  const trimmed = headerValue.trim();
  if (!trimmed) {
    return null;
  }

  if (/^bearer\s+/i.test(trimmed)) {
    return trimmed.replace(/^bearer\s+/i, "").trim();
  }

  return trimmed;
}

function isAuthorized(request: Request, expectedToken: string): boolean {
  const authHeader = resolveBearerToken(request.headers.get("authorization"));
  const fallbackHeader = resolveBearerToken(request.headers.get("x-admin-token"));

  return authHeader === expectedToken || fallbackHeader === expectedToken;
}

function normaliseSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (!slugPattern.test(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase();
}

function normalisePath(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("://")) {
    return null;
  }

  const normalised = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (normalised.includes("..")) {
    return null;
  }

  return normalised;
}

interface RevalidatePayload {
  slugs?: unknown;
  slug?: unknown;
  paths?: unknown;
  path?: unknown;
}

export async function POST(request: Request) {
  const configuredToken = process.env[TOKEN_ENV_KEY];
  if (!configuredToken) {
    console.error(`Missing required ${TOKEN_ENV_KEY} environment variable`);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!isAuthorized(request, configuredToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: RevalidatePayload = {};
  try {
    const rawBody = await request.text();
    if (rawBody.trim().length > 0) {
      payload = JSON.parse(rawBody) as RevalidatePayload;
    }
  } catch (error) {
    console.warn("Failed to parse revalidation payload", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const slugInputs: unknown[] = [];
  if (Array.isArray(payload.slugs)) {
    slugInputs.push(...payload.slugs);
  } else if (typeof payload.slugs === "string") {
    slugInputs.push(payload.slugs);
  }

  if (typeof payload.slug === "string") {
    slugInputs.push(payload.slug);
  }

  const normalisedSlugs = new Set<string>();
  for (const candidate of slugInputs) {
    if (typeof candidate !== "string") {
      return NextResponse.json({ error: "Slugs must be strings" }, { status: 400 });
    }

    const normalised = normaliseSlug(candidate);
    if (!normalised) {
      return NextResponse.json({ error: `Invalid slug: ${candidate}` }, { status: 400 });
    }

    normalisedSlugs.add(normalised);
  }

  const pathInputs: unknown[] = [];
  if (Array.isArray(payload.paths)) {
    pathInputs.push(...payload.paths);
  } else if (typeof payload.paths === "string") {
    pathInputs.push(payload.paths);
  }

  if (typeof payload.path === "string") {
    pathInputs.push(payload.path);
  }

  const normalisedPaths = new Set<string>();
  for (const candidate of pathInputs) {
    if (typeof candidate !== "string") {
      return NextResponse.json({ error: "Paths must be strings" }, { status: 400 });
    }

    const normalised = normalisePath(candidate);
    if (!normalised) {
      return NextResponse.json({ error: `Invalid path: ${candidate}` }, { status: 400 });
    }

    normalisedPaths.add(normalised);
  }

  const revalidatedTags = new Set<string>([BLOG_LIST_CACHE_TAG]);
  const revalidatedPaths = new Set<string>(["/writing", "/blog"]);

  try {
    revalidateTag(BLOG_LIST_CACHE_TAG);

    for (const slug of normalisedSlugs) {
      const tag = getBlogPostCacheTag(slug);
      revalidatedTags.add(tag);
      revalidateTag(tag);
      revalidatedPaths.add(`/writing/${slug}`);
      revalidatedPaths.add(`/blog/${slug}`);
    }

    for (const path of normalisedPaths) {
      revalidatedPaths.add(path);
    }

    for (const path of revalidatedPaths) {
      revalidatePath(path);
    }
  } catch (error) {
    console.error("Failed to execute revalidation", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }

  const response = NextResponse.json({
    revalidatedAt: new Date().toISOString(),
    tags: Array.from(revalidatedTags),
    paths: Array.from(revalidatedPaths),
    slugs: Array.from(normalisedSlugs),
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}
