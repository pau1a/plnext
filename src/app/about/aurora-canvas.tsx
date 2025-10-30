"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/motion";

type AuroraCanvasProps = {
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
};

const MAX_DPR = 2;

export default function AuroraCanvas({ containerRef, className }: AuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>();
  const pointerRef = useRef({ x: 0.5, y: 0.35 });
  const pointerTargetRef = useRef({ x: 0.5, y: 0.35 });
  const scrollRef = useRef(0);
  const timeRef = useRef(0);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const resize = () => {
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const maybeReset = (context as CanvasRenderingContext2D & {
        resetTransform?: () => void;
      }).resetTransform;

      if (typeof maybeReset === "function") {
        maybeReset.call(context);
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }

      context.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const updatePointer = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      pointerTargetRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    const resetPointer = () => {
      pointerTargetRef.current = { x: 0.5, y: 0.35 };
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer);

    const renderStatic = () => {
      if (width === 0 || height === 0) {
        return;
      }

      context.clearRect(0, 0, width, height);

      const base = context.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, "#083947");
      base.addColorStop(0.45, "#105a60");
      base.addColorStop(1, "#0a1f2c");
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);

      const overlay = context.createRadialGradient(width * 0.6, height * 0.35, 0, width * 0.6, height * 0.35, height * 0.65);
      overlay.addColorStop(0, "rgba(87, 227, 197, 0.55)");
      overlay.addColorStop(1, "rgba(87, 227, 197, 0)");
      context.fillStyle = overlay;
      context.fillRect(0, 0, width, height);
    };

    if (prefersReducedMotion) {
      renderStatic();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", updatePointer);
        window.removeEventListener("pointerleave", resetPointer);
      };
    }

    const draw = () => {
      const container = containerRef.current;
      if (!container) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const visible =
        rect.height + viewportHeight === 0
          ? 0
          : Math.min(
              1,
              Math.max((viewportHeight - rect.top) / (rect.height + viewportHeight), 0),
            );

      scrollRef.current += (visible - scrollRef.current) * 0.05;

      pointerRef.current.x += (pointerTargetRef.current.x - pointerRef.current.x) * 0.08;
      pointerRef.current.y += (pointerTargetRef.current.y - pointerRef.current.y) * 0.08;

      timeRef.current += 0.008;

      context.clearRect(0, 0, width, height);

      const base = context.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, "#041c2b");
      base.addColorStop(0.4, "#0b3d45");
      base.addColorStop(1, "#0b1a24");
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);

      const pointerX = pointerRef.current.x;
      const pointerY = pointerRef.current.y;
      const scroll = scrollRef.current;

      const waves = [
        { hue: 168, offset: 0.15, intensity: 0.65, drift: 0.6 },
        { hue: 198, offset: 0.45, intensity: 0.55, drift: 0.9 },
        { hue: 350, offset: 0.78, intensity: 0.4, drift: 1.2 },
      ];

      for (let index = 0; index < waves.length; index += 1) {
        const wave = waves[index];
        const sine = Math.sin(timeRef.current * wave.drift + index);
        const cx =
          width *
          (wave.offset + (pointerX - 0.5) * 0.35 + sine * 0.08 + scroll * 0.12);
        const cy =
          height *
          (0.25 + pointerY * 0.25 + index * 0.18 + scroll * (0.08 + index * 0.04));
        const radius = height * (0.65 + index * 0.3 + scroll * 0.25);

        const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const alpha = Math.min(0.72, 0.45 + scroll * 0.35);
        gradient.addColorStop(
          0,
          `hsla(${wave.hue + sine * 12}, 82%, 68%, ${alpha * wave.intensity})`,
        );
        gradient.addColorStop(
          1,
          `hsla(${wave.hue + 30}, 75%, 52%, 0)`,
        );

        context.globalCompositeOperation = "lighter";
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }

      const mist = context.createLinearGradient(0, height * 0.55, 0, height);
      mist.addColorStop(0, "rgba(15, 66, 86, 0.18)");
      mist.addColorStop(1, "rgba(15, 66, 86, 0)");
      context.fillStyle = mist;
      context.fillRect(0, 0, width, height);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, [containerRef, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx("about-aurora", className)}
      aria-hidden="true"
    />
  );
}
