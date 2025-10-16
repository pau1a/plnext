"use client";

import { useAnalyticsConsent } from "@/components/analytics-consent-provider";

export default function AnalyticsPreferences() {
  const { consent, hasHydrated, isConfigured, setConsent, resetConsent } = useAnalyticsConsent();

  if (!hasHydrated || !isConfigured || consent === "unset") {
    return null;
  }

  const isGranted = consent === "granted";
  const statusLabel = isGranted ? "Analytics is on" : "Analytics is off";

  return (
    <div className="analytics-preferences" role="group" aria-label="Analytics preferences">
      <p className="analytics-preferences__status">{statusLabel}</p>
      <div className="analytics-preferences__actions">
        <button
          type="button"
          className="button button--ghost button--xs"
          onClick={() => setConsent("granted")}
          disabled={isGranted}
        >
          Enable
        </button>
        <button
          type="button"
          className="button button--ghost button--xs"
          onClick={() => setConsent("denied")}
          disabled={!isGranted}
        >
          Disable
        </button>
        <button type="button" className="button button--link button--xs" onClick={resetConsent}>
          Reset choice
        </button>
      </div>
    </div>
  );
}
