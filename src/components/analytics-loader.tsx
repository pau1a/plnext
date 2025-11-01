"use client";

/**
 * AnalyticsLoader - Centralized analytics initialization and pageview tracking
 *
 * Features:
 * - Integrates with AnalyticsConsentProvider
 * - Initializes all configured vendors (GA4, PostHog, etc.)
 * - Tracks pageviews on route changes
 * - Handles consent changes (opt-in/out)
 * - Fires catch-up pageview when consent granted after landing
 *
 * Usage:
 * Mount once in app/layout.tsx inside <AnalyticsConsentProvider>
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalyticsConsent } from "./analytics-consent-provider";
import { analytics } from "@/lib/analytics/dispatcher";

export function AnalyticsLoader() {
  const { consent, hasHydrated } = useAnalyticsConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  // Initialize analytics when consent is granted
  useEffect(() => {
    if (!hasHydrated) return;
    if (consent !== "granted") return;
    if (hasInitialized.current) return;

    // Check if any vendor is configured
    if (!analytics.isAnyVendorConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AnalyticsLoader] No vendors configured - skipping initialization");
      }
      return;
    }

    // Initialize all configured vendors
    void (async () => {
      try {
        await analytics.initializeAll();
        analytics.optInAll();
        hasInitialized.current = true;

        // Fire initial pageview for current page
        const query = searchParams?.toString();
        const url = query ? `${pathname}?${query}` : pathname ?? "/";
        analytics.pageView(url, document.title);
        lastPathRef.current = url;

        if (process.env.NODE_ENV === "development") {
          console.log("[AnalyticsLoader] Initialized and tracked initial pageview:", url);
        }
      } catch (error) {
        console.error("[AnalyticsLoader] Initialization failed:", error);
      }
    })();
  }, [consent, hasHydrated, pathname, searchParams]);

  // Handle consent changes after initialization
  useEffect(() => {
    if (!hasHydrated || !hasInitialized.current) return;

    if (consent === "granted") {
      analytics.optInAll();
    } else if (consent === "denied") {
      analytics.optOutAll();
    }
  }, [consent, hasHydrated]);

  // Track pageviews on route changes
  useEffect(() => {
    if (!hasHydrated) return;
    if (consent !== "granted") return;
    if (!hasInitialized.current) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname ?? "/";

    // Avoid duplicate tracking of same URL
    if (url === lastPathRef.current) return;

    analytics.pageView(url, document.title);
    lastPathRef.current = url;

    if (process.env.NODE_ENV === "development") {
      console.log("[AnalyticsLoader] Pageview:", url);
    }
  }, [consent, hasHydrated, pathname, searchParams]);

  return null; // This component renders nothing
}
