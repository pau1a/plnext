"use client";

import { useAnalyticsConsent } from "@/components/analytics-consent-provider";

export default function AnalyticsConsentBanner() {
  const { consent, hasHydrated, isConfigured, setConsent } = useAnalyticsConsent();

  if (!hasHydrated || !isConfigured || consent !== "unset") {
    return null;
  }

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Analytics consent">
      <div className="consent-banner__content">
        <div>
          <p className="consent-banner__title">Help us understand what resonates.</p>
          <p className="consent-banner__body">
            We use PostHog to measure anonymous traffic patterns and improve the experience. No cookies or session recordings are
            stored unless you opt in.
          </p>
        </div>
        <div className="consent-banner__actions" role="group" aria-label="Analytics consent options">
          <button type="button" className="button button--primary" onClick={() => setConsent("granted")}>
            Allow analytics
          </button>
          <button type="button" className="button button--ghost" onClick={() => setConsent("denied")}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
