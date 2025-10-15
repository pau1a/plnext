"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
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

  return (
    <button
      type="button"
      className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-2 w-100 w-lg-auto"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
    >
      <i className={`fa-solid ${iconClass}`} aria-hidden="true" />
      <span className="small fw-semibold text-nowrap">{label}</span>
    </button>
  );
}
