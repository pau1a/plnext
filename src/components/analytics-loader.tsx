"use client";

/**
 * AnalyticsLoader - Centralized analytics initialization and pageview tracking
 *
 * Features:
 * - Integrates with AnalyticsConsentProvider
 * - Initializes consent-free vendors immediately (Umami)
 * - Initializes consent-required vendors after consent granted (GA4, PostHog)
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
  const consentFreeInitialized = useRef(false);
  const consentRequiredInitialized = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  // Initialize consent-free vendors immediately (e.g., Umami)
  // These vendors don't require user consent (cookie-free, privacy-first)
  useEffect(() => {
    if (!hasHydrated) return;
    if (consentFreeInitialized.current) return;

    void (async () => {
      try {
        await analytics.initializeConsentFree();
        consentFreeInitialized.current = true;

        // Fire initial pageview for current page
        const query = searchParams?.toString();
        const url = query ? `${pathname}?${query}` : pathname ?? "/";
        analytics.pageView(url, document.title);
        lastPathRef.current = url;

        if (process.env.NODE_ENV === "development") {
          console.log("[AnalyticsLoader] Initialized consent-free vendors and tracked initial pageview:", url);
        }
      } catch (error) {
        console.error("[AnalyticsLoader] Consent-free initialization failed:", error);
      }
    })();
  }, [hasHydrated, pathname, searchParams]);

  // Initialize consent-required vendors when consent is granted (e.g., GA4, PostHog)
  useEffect(() => {
    if (!hasHydrated) return;
    if (consent !== "granted") return;
    if (consentRequiredInitialized.current) return;

    void (async () => {
      try {
        await analytics.initializeConsentRequired();
        analytics.optInAll();
        consentRequiredInitialized.current = true;

        // Fire initial pageview for current page (catch-up for consent-required vendors)
        const query = searchParams?.toString();
        const url = query ? `${pathname}?${query}` : pathname ?? "/";
        analytics.pageView(url, document.title);

        if (process.env.NODE_ENV === "development") {
          console.log("[AnalyticsLoader] Initialized consent-required vendors and tracked catch-up pageview:", url);
        }
      } catch (error) {
        console.error("[AnalyticsLoader] Consent-required initialization failed:", error);
      }
    })();
  }, [consent, hasHydrated, pathname, searchParams]);

  // Handle consent changes after initialization
  useEffect(() => {
    if (!hasHydrated || !consentRequiredInitialized.current) return;

    if (consent === "granted") {
      analytics.optInAll();
    } else if (consent === "denied") {
      analytics.optOutAll();
    }
  }, [consent, hasHydrated]);

  // Track pageviews on route changes
  // This tracks for ALL initialized vendors (consent-free and consent-required if granted)
  useEffect(() => {
    if (!hasHydrated) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname ?? "/";

    // Avoid duplicate tracking of same URL
    if (url === lastPathRef.current) return;

    // Track pageview if ANY vendor is initialized
    if (consentFreeInitialized.current || (consentRequiredInitialized.current && consent === "granted")) {
      analytics.pageView(url, document.title);
      lastPathRef.current = url;

      if (process.env.NODE_ENV === "development") {
        console.log("[AnalyticsLoader] Pageview:", url);
      }
    }
  }, [consent, hasHydrated, pathname, searchParams]);

  return null; // This component renders nothing
}
