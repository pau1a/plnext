"use client";

import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let hasInitialized = false;

export function initPosthog() {
  if (hasInitialized || typeof window === "undefined" || !POSTHOG_KEY) {
    return hasInitialized;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: true,
    session_recording: {
      // Respect privacy expectations and only enable lightweight analytics.
      recordCanvas: false,
      maskAllInputs: true,
    },
    autocapture: false,
    disable_cookie: true,
    persistence: "localStorage",
  });

  hasInitialized = true;
  return hasInitialized;
}

export function isPosthogEnabled() {
  return Boolean(POSTHOG_KEY);
}

export function hasPosthogStarted() {
  return hasInitialized;
}

export function shutdownPosthog() {
  if (!hasInitialized) {
    return;
  }

  posthog.opt_out_capturing();
}

export function trackPageview(url: string) {
  if (!hasInitialized) {
    return;
  }

  posthog.capture("$pageview", {
    $current_url: url,
  });
}

export function identifyUser(userId: string) {
  if (!hasInitialized) {
    return;
  }

  posthog.identify(userId);
}

export { posthog };
