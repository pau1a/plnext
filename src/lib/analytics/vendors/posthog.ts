"use client";

/**
 * PostHog vendor adapter
 *
 * Wraps the existing PostHog implementation with the AnalyticsVendor interface
 * for unified dispatcher integration.
 */

import type { AnalyticsEvent, AnalyticsVendor, PageViewEvent } from "../types";
import posthogClient, { isPosthogConfigured, hasPosthogStarted } from "../posthog";

class PostHogVendor implements AnalyticsVendor {
  readonly name = "posthog";

  isConfigured(): boolean {
    return isPosthogConfigured();
  }

  hasStarted(): boolean {
    return hasPosthogStarted();
  }

  async init(): Promise<void> {
    // PostHog auto-initializes on first use, so we just need to ensure it's configured
    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[PostHog] Not configured - skipping initialization");
      }
      return;
    }

    // Trigger initialization by calling a method
    posthogClient.register({});

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Initialized");
    }
  }

  pageView(event: PageViewEvent): void {
    if (!this.hasStarted() && !this.isConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[PostHog] Skipping pageview (not configured):", event);
      }
      return;
    }

    posthogClient.capture("$pageview", {
      $current_url: event.url,
      $title: event.title,
      $referrer: event.referrer,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Pageview:", event);
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.hasStarted() && !this.isConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[PostHog] Skipping event (not configured):", event);
      }
      return;
    }

    posthogClient.track(event.name, event.properties);

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Event:", event);
    }
  }

  optIn(): void {
    if (!this.isConfigured()) return;

    posthogClient.optIn();
    posthogClient.register({ analytics_consent: "granted" });
    posthogClient.capture("analytics_consent_updated", { status: "granted" });

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Consent granted");
    }
  }

  optOut(): void {
    if (!this.hasStarted()) return;

    posthogClient.capture("analytics_consent_updated", { status: "denied" });
    posthogClient.optOut();

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Consent denied");
    }
  }

  reset(): void {
    posthogClient.reset();

    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Reset");
    }
  }
}

// Export singleton instance
export const posthogVendor = new PostHogVendor();
