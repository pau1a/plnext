"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export default function BodyThemeSync() {
  const { resolvedTheme, theme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    const nextTheme = resolvedTheme || theme;
    if (!nextTheme) {
      return;
    }

    const body = globalThis.document?.body;
    if (!body) {
      return;
    }

    if (previousTheme.current) {
      body.classList.remove(previousTheme.current);
    }

    body.classList.add(nextTheme);
    previousTheme.current = nextTheme;

    return () => {
      if (previousTheme.current) {
        body.classList.remove(previousTheme.current);
        previousTheme.current = undefined;
      }
    };
  }, [resolvedTheme, theme]);

  return null;
}
