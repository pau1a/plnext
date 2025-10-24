"use client";

import { useAnalyticsConsent } from "@/components/analytics-consent-provider";
import posthog from "@/lib/analytics/posthog";
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

  const handleClick = () => {
    setTheme(nextTheme);

    if (isConfigured && consent === "granted") {
      posthog.capture("ui_theme_toggle", { theme: nextTheme });
    }
  };

  return (
    <button
      type="button"
      className="app-nav__theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
    >
      <i className={`fa-solid ${iconClass} app-nav__theme-icon`} aria-hidden="true" />
    </button>
  );
}
