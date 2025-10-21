"use client";

import clsx from "clsx";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

import { createMotionVars, usePrefersReducedMotion } from "@/lib/motion";

type MotionFadeChild = ReactElement<{
  className?: string;
  style?: CSSProperties;
}>;

type MotionFadeProps = {
  children: MotionFadeChild;
  delay?: number;
  duration?: number;
  offset?: number;
};

export default function MotionFade({
  children,
  delay = 0,
  duration,
  offset,
}: MotionFadeProps) {
  if (!isValidElement(children)) {
    throw new Error("MotionFade expects a single React element child.");
  }

  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const [isReady, setIsReady] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setIsReady(true);
      return;
    }

    setIsReady(false);

    const frame = requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate]);

  const motionVars = useMemo(
    () => createMotionVars(shouldAnimate, delay, offset, duration),
    [delay, duration, offset, shouldAnimate],
  );

  const className = clsx(
    children.props.className,
    shouldAnimate && "motionFade",
    shouldAnimate && isReady && "motionFadeReady",
  );

  const style = motionVars
    ? ({ ...children.props.style, ...motionVars } as CSSProperties)
    : children.props.style;

  return cloneElement(children, { className, style });
}

