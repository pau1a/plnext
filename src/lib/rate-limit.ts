import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type MemoryBucket = {
  remaining: number;
  reset: number;
};

const MEMORY_LIMIT_IP = 5;
const MEMORY_LIMIT_SLUG = 30;
const MEMORY_LIMIT_CONTACT_IP = 3;
const MEMORY_LIMIT_CONTACT_EMAIL = 3;
const WINDOW_MS = 60_000;

const redisConfigured =
  typeof process !== "undefined" &&
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = redisConfigured ? Redis.fromEnv() : null;

const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MEMORY_LIMIT_IP, "60 s"),
      prefix: "comments:ip",
    })
  : null;

const slugLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MEMORY_LIMIT_SLUG, "60 s"),
      prefix: "comments:slug",
    })
  : null;

const contactIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MEMORY_LIMIT_CONTACT_IP, "60 s"),
      prefix: "contact:ip",
    })
  : null;

const contactEmailLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MEMORY_LIMIT_CONTACT_EMAIL, "60 s"),
      prefix: "contact:email",
    })
  : null;

const memoryBuckets = new Map<string, MemoryBucket>();

function memoryLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.reset <= now) {
    const nextReset = now + WINDOW_MS;
    const entry: MemoryBucket = {
      remaining: limit - 1,
      reset: nextReset,
    };
    memoryBuckets.set(key, entry);
    return {
      success: true,
      limit,
      remaining: entry.remaining,
      reset: nextReset,
    };
  }

  if (bucket.remaining <= 0) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: bucket.reset,
    };
  }

  bucket.remaining -= 1;
  memoryBuckets.set(key, bucket);
  return {
    success: true,
    limit,
    remaining: bucket.remaining,
    reset: bucket.reset,
  };
}

async function applyLimit(
  limiter: Ratelimit | null,
  key: string,
  limit: number,
): Promise<RateLimitResult> {
  if (limiter) {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryLimit(key, limit);
}

export async function enforceCommentRateLimits(key: { ipHash: string; slug: string }) {
  const ipKey = `ip:${key.ipHash}`;
  const slugKey = `slug:${key.slug}`;

  const [ip, slug] = await Promise.all([
    applyLimit(ipLimiter, ipKey, MEMORY_LIMIT_IP),
    applyLimit(slugLimiter, slugKey, MEMORY_LIMIT_SLUG),
  ]);

  return { ip, slug };
}

export type CommentRateLimitOutcome = Awaited<ReturnType<typeof enforceCommentRateLimits>>;

export async function enforceContactRateLimits(key: { ipHash: string; emailHash: string }) {
  const ipKey = `ip:${key.ipHash}`;
  const emailKey = `email:${key.emailHash}`;

  const [ip, email] = await Promise.all([
    applyLimit(contactIpLimiter, ipKey, MEMORY_LIMIT_CONTACT_IP),
    applyLimit(contactEmailLimiter, emailKey, MEMORY_LIMIT_CONTACT_EMAIL),
  ]);

  return { ip, email };
}

export type ContactRateLimitOutcome = Awaited<ReturnType<typeof enforceContactRateLimits>>;
