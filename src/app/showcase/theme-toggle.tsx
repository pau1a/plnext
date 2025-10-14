"use client";

import clsx from "clsx";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Theme toggle lives in the navbar to prove next-themes persistence and styling.
export default function ShowcaseThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={clsx(
        "btn",
        "showcase-theme-toggle",
        isDark ? "btn-outline-light" : "btn-outline-dark"
      )}
    >
      <i className={clsx("fa-solid", isDark ? "fa-sun" : "fa-moon", "me-2")} aria-hidden="true" />
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
