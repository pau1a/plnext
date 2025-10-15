"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ShowcaseThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="palette-demo__theme-toggle-placeholder" aria-hidden />;
  }

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const iconClass = resolvedTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  const label = resolvedTheme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <button
      type="button"
      className="btn palette-demo__theme-toggle"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
    >
      <i className={`${iconClass} me-1`} aria-hidden />
      <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

