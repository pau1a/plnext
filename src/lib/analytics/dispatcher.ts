/**
 * Analytics dispatcher - unified interface for all analytics vendors
 *
 * Coordinates PostHog, GA4, and any future vendors.
 * All tracking calls go through this dispatcher for consistency.
 */

import type { AnalyticsEvent, AnalyticsVendor, PageViewEvent } from "./types";
import { ga4Vendor } from "./vendors/ga4";
import { posthogVendor } from "./vendors/posthog";
import { umamiVendor } from "./vendors/umami";

class AnalyticsDispatcher {
  private vendors: AnalyticsVendor[] = [];
  private initializedVendors = new Set<string>();

  constructor() {
    // Register available vendors
    this.registerVendor(ga4Vendor);
    this.registerVendor(posthogVendor);
    this.registerVendor(umamiVendor); // Consent-free, privacy-first analytics
  }

  /**
   * Register a vendor for tracking
   */
  registerVendor(vendor: AnalyticsVendor): void {
    if (!this.vendors.find((v) => v.name === vendor.name)) {
      this.vendors.push(vendor);
    }
  }

  /**
   * Get list of configured vendors
   */
  getConfiguredVendors(): AnalyticsVendor[] {
    return this.vendors.filter((v) => v.isConfigured());
  }

  /**
   * Get list of consent-free vendors (e.g., Umami)
   */
  getConsentFreeVendors(): AnalyticsVendor[] {
    return this.vendors.filter((v) => v.isConfigured() && v.requiresConsent === false);
  }

  /**
   * Get list of consent-required vendors (e.g., GA4, PostHog)
   */
  getConsentRequiredVendors(): AnalyticsVendor[] {
    return this.vendors.filter((v) => v.isConfigured() && v.requiresConsent !== false);
  }

  /**
   * Check if any vendor is configured
   */
  isAnyVendorConfigured(): boolean {
    return this.vendors.some((v) => v.isConfigured());
  }

  /**
   * Initialize all configured vendors
   */
  async initializeAll(): Promise<void> {
    const configured = this.getConfiguredVendors();

    if (configured.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] No vendors configured");
      }
      return;
    }

    const promises = configured.map(async (vendor) => {
      if (this.initializedVendors.has(vendor.name)) {
        return; // Already initialized
      }

      try {
        await vendor.init();
        this.initializedVendors.add(vendor.name);

        if (process.env.NODE_ENV === "development") {
          console.log(`[Analytics] Initialized ${vendor.name}`);
        }
      } catch (error) {
        console.error(`[Analytics] Failed to initialize ${vendor.name}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Initialize consent-free vendors only (e.g., Umami)
   * These vendors don't require user consent
   */
  async initializeConsentFree(): Promise<void> {
    const consentFree = this.getConsentFreeVendors();

    if (consentFree.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] No consent-free vendors configured");
      }
      return;
    }

    const promises = consentFree.map(async (vendor) => {
      if (this.initializedVendors.has(vendor.name)) {
        return; // Already initialized
      }

      try {
        await vendor.init();
        this.initializedVendors.add(vendor.name);

        if (process.env.NODE_ENV === "development") {
          console.log(`[Analytics] Initialized consent-free vendor: ${vendor.name}`);
        }
      } catch (error) {
        console.error(`[Analytics] Failed to initialize ${vendor.name}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Initialize consent-required vendors only (e.g., GA4, PostHog)
   * These vendors require explicit user consent
   */
  async initializeConsentRequired(): Promise<void> {
    const consentRequired = this.getConsentRequiredVendors();

    if (consentRequired.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] No consent-required vendors configured");
      }
      return;
    }

    const promises = consentRequired.map(async (vendor) => {
      if (this.initializedVendors.has(vendor.name)) {
        return; // Already initialized
      }

      try {
        await vendor.init();
        this.initializedVendors.add(vendor.name);

        if (process.env.NODE_ENV === "development") {
          console.log(`[Analytics] Initialized consent-required vendor: ${vendor.name}`);
        }
      } catch (error) {
        console.error(`[Analytics] Failed to initialize ${vendor.name}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Track a pageview across all started vendors
   */
  pageView(url: string, title?: string, referrer?: string): void {
    const event: PageViewEvent = { url, title, referrer };

    this.vendors.forEach((vendor) => {
      if (vendor.hasStarted()) {
        vendor.pageView(event);
      }
    });
  }

  /**
   * Track a custom event across all started vendors
   */
  track(name: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = { name, properties };

    // If no vendors started, log to console in development
    if (!this.vendors.some((v) => v.hasStarted())) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Event (no vendors active):", event);
      }
      return;
    }

    this.vendors.forEach((vendor) => {
      if (vendor.hasStarted()) {
        vendor.track(event);
      }
    });
  }

  /**
   * Grant consent for all vendors
   */
  optInAll(): void {
    this.vendors.forEach((vendor) => {
      if (vendor.isConfigured()) {
        vendor.optIn();
      }
    });
  }

  /**
   * Revoke consent for all vendors
   */
  optOutAll(): void {
    this.vendors.forEach((vendor) => {
      if (vendor.hasStarted()) {
        vendor.optOut();
      }
    });
  }

  /**
   * Reset all vendors
   */
  resetAll(): void {
    this.vendors.forEach((vendor) => {
      if (vendor.hasStarted()) {
        vendor.reset();
      }
    });
    this.initializedVendors.clear();
  }
}

// Export singleton instance
export const analytics = new AnalyticsDispatcher();

// Convenience exports
export const track = analytics.track.bind(analytics);
export const pageView = analytics.pageView.bind(analytics);
