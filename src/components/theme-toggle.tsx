"use client";

import { useAnalyticsConsent } from "@/components/analytics-consent-provider";
import { posthog } from "@/lib/analytics/posthog";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { consent, isConfigured } = useAnalyticsConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = resolvedTheme ?? "light";
  const isDark = currentTheme === "dark";
  const iconClass = isDark ? "fa-sun" : "fa-moon";
  const nextTheme = isDark ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;

  const handleClick = () => {
    setTheme(nextTheme);

    if (isConfigured && consent === "granted") {
      posthog.capture("ui_theme_toggle", { theme: nextTheme });
    }
  };

  return (
    <button
      type="button"
      className="button button--ghost button--sm u-inline-flex u-items-center u-gap-xs u-nowrap"
      onClick={handleClick}
      aria-label={label}
    >
      <i className={`fa-solid ${iconClass}`} aria-hidden="true" />
      <span className="u-text-xs u-font-semibold">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
