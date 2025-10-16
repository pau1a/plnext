"use client";

/**
 * Optional PostHog analytics facade.
 * - No build-time dependency on "posthog-js".
 * - If NEXT_PUBLIC_POSTHOG_KEY is missing or import fails, methods become no-ops.
 * - Safe to import anywhere in client components.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHogClient = {
  init?: (key: string, opts?: Record<string, unknown>) => void;
  capture?: (event: string, properties?: Record<string, unknown>) => void;
  identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset?: () => void;
  opt_in_capturing?: () => void;
  opt_out_capturing?: () => void;
  register?: (properties: Record<string, unknown>) => void;
};

let client: PostHogClient | null = null;
let initPromise: Promise<PostHogClient | null> | null = null;

async function ensureClient(): Promise<PostHogClient | null> {
  if (client) return client;
  if (initPromise) return initPromise;
  if (!POSTHOG_KEY) return null;

  initPromise = (async () => {
    try {
      // Dynamically import only when a key exists; bundler won’t try to resolve otherwise.
      const mod = await import("posthog-js");
      const ph = (mod?.default ?? mod) as PostHogClient;
      ph.init?.(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        persistence: "memory",
        autocapture: false,
        disable_session_recording: true,
        capture_pageview: false,
        capture_pageleave: false,
        ip: false,
      });
      client = ph;
      return ph;
    } catch {
      // Missing package or runtime import failure → silently degrade.
      client = null;
      return null;
    }
  })();

  return initPromise;
}

function fire<K extends keyof PostHogClient>(
  method: K,
  ...args: Parameters<NonNullable<PostHogClient[K]>>
): void {
  // Fire-and-forget; becomes a no-op if client is unavailable.
  void ensureClient().then((ph) => {
    const fn = ph?.[method];
    if (typeof fn === "function") {
      (fn as (...inner: Parameters<NonNullable<PostHogClient[K]>>) => void)(...args);
    }
  });
}

// Default export keeps your existing imports working:
//   import posthog from "@/lib/analytics/posthog"
const analytics = {
  capture: (event: string, properties?: Record<string, unknown>) =>
    fire("capture", event, properties),
  identify: (distinctId: string, properties?: Record<string, unknown>) =>
    fire("identify", distinctId, properties),
  reset: () => fire("reset"),
  optIn: () => fire("opt_in_capturing"),
  optOut: () => fire("opt_out_capturing"),
  register: (properties: Record<string, unknown>) => fire("register", properties),
};

export function isPosthogConfigured() {
  return Boolean(POSTHOG_KEY);
}

export function hasPosthogStarted() {
  return client !== null;
}

export async function withPosthog<T>(callback: (client: PostHogClient) => T | Promise<T>) {
  const ph = await ensureClient();
  if (!ph) return undefined;
  return callback(ph);
}

export default analytics;
