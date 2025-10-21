"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type MotionVars = CSSProperties & {
  "--motion-delay"?: string;
  "--motion-duration"?: string;
  "--motion-ease"?: string;
  "--motion-offset"?: string;
};

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function useRevealOnView<T extends HTMLElement>(
  enabled: boolean,
  options: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const target = ref.current;

    if (!target) {
      return;
    }

    let didCancel = false;

    const observer = new IntersectionObserver((entries, observerRef) => {
      entries.forEach((entry) => {
        if (!didCancel && entry.isIntersecting) {
          setIsVisible(true);
          observerRef.disconnect();
        }
      });
    }, options);

    observer.observe(target);

    return () => {
      didCancel = true;
      observer.disconnect();
    };
  }, [enabled, options]);

  return useMemo(() => ({ ref, isVisible }) as const, [isVisible]);
}

export function createMotionVars(
  shouldAnimate: boolean,
  delay: number,
  offset = 10,
  duration = 0.4,
): MotionVars | undefined {
  if (!shouldAnimate) {
    return undefined;
  }

  return {
    "--motion-delay": `${delay}s`,
    "--motion-duration": `${duration}s`,
    "--motion-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
    "--motion-offset": `${offset}px`,
  } satisfies MotionVars;
}

