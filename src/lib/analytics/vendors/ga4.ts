/**
 * Google Analytics 4 vendor adapter
 *
 * Features:
 * - Dynamic script loading (no build dependency)
 * - Runtime configuration via admin API
 * - Falls back to environment variables
 * - Consent-aware initialization
 * - Graceful degradation when GA_MEASUREMENT_ID missing
 * - IP anonymization enabled by default
 */

import type { AnalyticsEvent, AnalyticsVendor, PageViewEvent } from "../types";

// Environment variable fallbacks (build-time)
const ENV_GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const ENV_GA_ENABLED = process.env.NEXT_PUBLIC_GA_ENABLED !== "false";

// Global gtag function interface
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GA4Settings = {
  measurementId: string;
  enabled: boolean;
};

let scriptLoaded = false;
let initPromise: Promise<void> | null = null;
let settingsFetched = false;

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function loadGAScript(measurementId: string): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptLoaded = false;
      initPromise = null;
      reject(new Error("Failed to load Google Analytics script"));
    };
    document.head.appendChild(script);
  });

  return initPromise;
}

class GA4Vendor implements AnalyticsVendor {
  readonly name = "ga4";
  readonly requiresConsent = true; // Requires explicit user consent
  private initialized = false;
  private settings: GA4Settings | null = null;
  private currentMeasurementId: string = "";

  /**
   * Fetch GA4 settings from admin API
   * Falls back to environment variables if API fails
   */
  private async fetchSettings(): Promise<GA4Settings> {
    if (settingsFetched && this.settings) {
      return this.settings;
    }

    try {
      const response = await fetch("/api/analytics-settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = (await response.json()) as { ga4: GA4Settings };
      this.settings = data.ga4;
      settingsFetched = true;

      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Fetched settings from API:", this.settings);
      }

      return this.settings;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Failed to fetch settings, using environment variables:", error);
      }

      // Fall back to env vars
      this.settings = {
        measurementId: ENV_GA_MEASUREMENT_ID,
        enabled: ENV_GA_ENABLED,
      };
      settingsFetched = true;

      return this.settings;
    }
  }

  isConfigured(): boolean {
    // Can't determine without settings, assume true if env vars exist
    if (!settingsFetched) {
      return Boolean(ENV_GA_MEASUREMENT_ID && ENV_GA_ENABLED);
    }

    return Boolean(this.settings?.measurementId && this.settings?.enabled);
  }

  hasStarted(): boolean {
    return this.initialized && scriptLoaded;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    // Fetch settings first
    const settings = await this.fetchSettings();

    if (!settings.measurementId || !settings.enabled) {
      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Not configured - skipping initialization");
      }
      return;
    }

    this.currentMeasurementId = settings.measurementId;

    try {
      await loadGAScript(this.currentMeasurementId);

      // Initialize gtag with default config
      gtag("js", new Date());
      gtag("config", this.currentMeasurementId, {
        anonymize_ip: true,
        send_page_view: false, // We handle pageviews manually
        cookie_flags: "SameSite=None;Secure",
      });

      this.initialized = true;

      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Initialized with measurement ID:", this.currentMeasurementId);
      }
    } catch (error) {
      console.error("[GA4] Initialization failed:", error);
      throw error;
    }
  }

  pageView(event: PageViewEvent): void {
    if (!this.hasStarted()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Skipping pageview (not started):", event);
      }
      return;
    }

    gtag("event", "page_view", {
      page_location: event.url,
      page_title: event.title || document.title,
      page_referrer: event.referrer || document.referrer,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Pageview:", event);
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.hasStarted()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[GA4] Skipping event (not started):", event);
      }
      return;
    }

    gtag("event", event.name, event.properties);

    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Event:", event);
    }
  }

  optIn(): void {
    if (!this.isConfigured()) return;

    gtag("consent", "update", {
      analytics_storage: "granted",
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Consent granted");
    }
  }

  optOut(): void {
    if (!this.hasStarted()) return;

    gtag("consent", "update", {
      analytics_storage: "denied",
    });

    // Disable GA collection
    if (typeof window !== "undefined" && window.gtag && this.currentMeasurementId) {
      (window as Record<string, unknown>)[`ga-disable-${this.currentMeasurementId}`] = true;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Consent denied");
    }
  }

  reset(): void {
    // GA4 doesn't have a built-in reset method like PostHog
    // But we can disable it and clear cookies
    this.optOut();

    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Reset");
    }
  }
}

// Export singleton instance
export const ga4Vendor = new GA4Vendor();
