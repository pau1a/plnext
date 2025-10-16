"use client";

import {
  hasPosthogStarted,
  initPosthog,
  isPosthogEnabled,
  posthog,
  shutdownPosthog,
  trackPageview,
} from "@/lib/analytics/posthog";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ConsentState = "granted" | "denied" | "unset";

type AnalyticsConsentContextValue = {
  consent: ConsentState;
  hasHydrated: boolean;
  isConfigured: boolean;
  setConsent: (state: Exclude<ConsentState, "unset">) => void;
  resetConsent: () => void;
};

const STORAGE_KEY = "plnext.analytics-consent";

const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue | undefined>(undefined);

function getInitialConsent(): ConsentState {
  if (typeof window === "undefined") {
    return "unset";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }

  return "unset";
}

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [consent, setConsentState] = useState<ConsentState>("unset");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isConfigured = isPosthogEnabled();

  useEffect(() => {
    setConsentState(getInitialConsent());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || consent === "unset") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, consent);
  }, [consent, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !isConfigured) {
      return;
    }

    if (consent === "granted") {
      initPosthog();
      posthog.opt_in_capturing();
      posthog.register({ analytics_consent: "granted" });
      posthog.capture("analytics_consent_updated", { status: "granted" });
    } else if (consent === "denied") {
      if (hasPosthogStarted()) {
        posthog.capture("analytics_consent_updated", { status: "denied" });
      }
      shutdownPosthog();
    }
  }, [consent, hasHydrated, isConfigured]);

  useEffect(() => {
    if (!hasHydrated || consent !== "granted" || !isConfigured) {
      return;
    }

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname ?? "/";
    trackPageview(url);
  }, [consent, hasHydrated, isConfigured, pathname, searchParams]);

  const updateConsent = useCallback((state: Exclude<ConsentState, "unset">) => {
    setConsentState(state);
  }, []);

  const resetConsent = useCallback(() => {
    setConsentState("unset");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    shutdownPosthog();
  }, []);

  const value = useMemo<AnalyticsConsentContextValue>(
    () => ({
      consent,
      hasHydrated,
      isConfigured,
      setConsent: updateConsent,
      resetConsent,
    }),
    [consent, hasHydrated, isConfigured, resetConsent, updateConsent],
  );

  return <AnalyticsConsentContext.Provider value={value}>{children}</AnalyticsConsentContext.Provider>;
}

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsConsentContext);
  if (!context) {
    throw new Error("useAnalyticsConsent must be used within AnalyticsConsentProvider");
  }
  return context;
}
