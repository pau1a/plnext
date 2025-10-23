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
  type ReactNode,
} from "react";

import { createMotionVars, usePrefersReducedMotion } from "@/lib/motion";

type MotionFadeChild = ReactElement<{
  className?: string;
  style?: CSSProperties;
}>;

type MotionFadeProps = {
  children: MotionFadeChild | ReactNode;
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

  const motionClassName = clsx(
    shouldAnimate && "motionFade",
    shouldAnimate && isReady && "motionFadeReady",
  );

  if (isValidElement(children)) {
    const className = clsx(children.props.className, motionClassName);
    const style = motionVars
      ? ({ ...children.props.style, ...motionVars } as CSSProperties)
      : children.props.style;

    return cloneElement(children, { className, style });
  }

  const style = motionVars ?? undefined;

  return (
    <div className={motionClassName} style={style}>
      {children}
    </div>
  );
}

