/**
 * Umami Analytics vendor adapter
 *
 * Features:
 * - Cookie-free, privacy-first analytics
 * - First-party data collection via `/e` endpoint
 * - No consent required (no PII, no cookies)
 * - Self-hosted on paulalivingstone.com infrastructure
 * - Script loaded from CDN for performance
 */

import type { AnalyticsEvent, AnalyticsVendor, PageViewEvent } from "../types";

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? "";
const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT ?? "";
const UMAMI_HOST_URL = process.env.NEXT_PUBLIC_UMAMI_HOST ?? "/e";

// Umami global interface
declare global {
  interface Window {
    umami?: {
      track: (event: string | { name: string; data?: Record<string, unknown> }) => void;
    };
  }
}

let scriptLoaded = false;
let scriptLoading = false;

/**
 * Load Umami tracking script
 * Script automatically tracks pageviews once loaded
 */
function loadUmamiScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();

  scriptLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "umami-script";
    script.async = true;
    script.src = UMAMI_SCRIPT_URL;
    script.setAttribute("data-website-id", UMAMI_WEBSITE_ID);
    script.setAttribute("data-host-url", UMAMI_HOST_URL);
    script.setAttribute("data-auto-track", "false"); // We'll track manually for better control

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
    };

    script.onerror = () => {
      scriptLoading = false;
      reject(new Error("Failed to load Umami script"));
    };

    document.head.appendChild(script);
  });
}

class UmamiVendor implements AnalyticsVendor {
  readonly name = "umami";
  readonly requiresConsent = false; // Cookie-free, privacy-first, consent-exempt
  private initialized = false;

  isConfigured(): boolean {
    return Boolean(UMAMI_WEBSITE_ID && UMAMI_SCRIPT_URL);
  }

  hasStarted(): boolean {
    return this.initialized && scriptLoaded;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Not configured - skipping initialization");
      }
      return;
    }

    try {
      await loadUmamiScript();
      this.initialized = true;

      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Initialized with website ID:", UMAMI_WEBSITE_ID);
        console.log("[Umami] Tracking endpoint:", UMAMI_HOST_URL);
      }
    } catch (error) {
      console.error("[Umami] Initialization failed:", error);
      throw error;
    }
  }

  pageView(event: PageViewEvent): void {
    if (!this.hasStarted()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Skipping pageview (not started):", event);
      }
      return;
    }

    // Umami tracks pageviews via their track function
    // Format: umami.track((props) => ({ ...props, url: event.url, title: event.title }))
    if (window.umami?.track) {
      window.umami.track({
        name: "pageview",
        data: {
          url: event.url,
          title: event.title || document.title,
          referrer: event.referrer || document.referrer,
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Pageview:", event);
      }
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.hasStarted()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Skipping event (not started):", event);
      }
      return;
    }

    if (window.umami?.track) {
      window.umami.track({
        name: event.name,
        data: event.properties,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[Umami] Event:", event);
      }
    }
  }

  /**
   * Umami is cookie-free and consent-exempt
   * These methods are no-ops but required by interface
   */
  optIn(): void {
    // No-op: Umami doesn't require opt-in
    if (process.env.NODE_ENV === "development") {
      console.log("[Umami] Opt-in called (no-op - Umami is consent-free)");
    }
  }

  optOut(): void {
    // No-op: Umami doesn't require opt-out
    if (process.env.NODE_ENV === "development") {
      console.log("[Umami] Opt-out called (no-op - Umami is consent-free)");
    }
  }

  reset(): void {
    // No-op: Umami doesn't store client-side data
    if (process.env.NODE_ENV === "development") {
      console.log("[Umami] Reset called (no-op - Umami has no client state)");
    }
  }
}

// Export singleton instance
export const umamiVendor = new UmamiVendor();

/**
 * Check if Umami should run regardless of consent
 * Umami is cookie-free and privacy-first, so it's exempt from consent requirements
 */
export function isConsentFree(): boolean {
  return true;
}
