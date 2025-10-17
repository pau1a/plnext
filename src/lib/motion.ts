import { useMemo } from "react";
import type { TargetAndTransition, Transition, Variants } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export const motionDurations = {
  xshort: 0.12,
  short: 0.2,
  base: 0.35,
  long: 0.6,
} as const;

export const motionEasings = {
  standard: [0.2, 0, 0.2, 1] as Transition["ease"],
  emphasized: [0.16, 1, 0.3, 1] as Transition["ease"],
} as const;

export type EntranceConfig = {
  delay?: number;
  duration?: number;
  offset?: number;
};

export const viewportDefaults = {
  once: true,
  amount: 0.35,
  margin: "0px 0px -60px 0px",
} as const;

const zeroTransition: Transition = { duration: 0 };

export function createFadeInVariants({
  delay = 0,
  duration = motionDurations.base,
}: Omit<EntranceConfig, "offset"> = {}): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        duration,
        ease: motionEasings.standard,
      },
    },
  };
}

export function createFadeInUpVariants({
  delay = 0,
  duration = motionDurations.long,
  offset = 32,
}: EntranceConfig = {}): Variants {
  return {
    hidden: {
      opacity: 0,
      y: offset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration,
        ease: motionEasings.emphasized,
      },
    },
  };
}

export function useMotionVariants(variants: Variants) {
  const shouldReduceMotion = useReducedMotion();

  const resolvedVariants = useMemo(() => {
    if (!shouldReduceMotion) {
      return variants;
    }

    const visible = variants.visible;

    if (typeof visible === "function") {
      return variants;
    }

    const neutralState: TargetAndTransition =
      visible && typeof visible === "object"
        ? { ...visible, transition: zeroTransition }
        : { opacity: 1, transition: zeroTransition };

    return {
      ...variants,
      hidden: neutralState,
      visible: neutralState,
    } satisfies Variants;
  }, [shouldReduceMotion, variants]);

  return {
    variants: resolvedVariants,
    shouldReduceMotion,
  } as const;
}
