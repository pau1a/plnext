"use client";

import { useEffect, useState } from "react";

import styles from "@/styles/dev-overlay.module.scss";

type OverlayLine = {
  index: number;
  position: number;
};

type OverlayLabel = {
  index: number;
  position: number;
};

const isDev = process.env.NODE_ENV === "development";

export default function DevSectionOverlay() {
  const [lines, setLines] = useState<OverlayLine[]>([]);
  const [labels, setLabels] = useState<OverlayLabel[]>([]);

  useEffect(() => {
    if (!isDev || typeof window === "undefined") {
      return;
    }

    const root = document.querySelector<HTMLElement>(
      '[data-dev-shell="home"]',
    );

    if (!root) {
      return;
    }

    const getSections = () =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-home-section]"));

    const getHero = () =>
      root.querySelector<HTMLElement>("[data-home-hero]");

    const updateLines = () => {
      const sections = getSections();
      const hero = getHero();
      const zones = [...(hero ? [hero] : []), ...sections];

      if (zones.length === 0) {
        setLines([]);
        setLabels([]);
        return;
      }

      const rootRectTop = root.getBoundingClientRect().top + window.scrollY;
      const rootHeight = root.getBoundingClientRect().height;

      const nextLines: OverlayLine[] = [];
      const nextLabels: OverlayLabel[] = [];

      zones.forEach((zone, index) => {
        const rect = zone.getBoundingClientRect();
        const zoneTop = rect.top + window.scrollY - rootRectTop;
        const zoneBottom = rect.bottom + window.scrollY - rootRectTop;
        const clampedTop = Math.max(0, zoneTop);
        const clampedBottom = Math.min(rootHeight, zoneBottom);
        const zoneHeight = Math.max(0, clampedBottom - clampedTop);

        if (index < zones.length - 1) {
          nextLines.push({
            index: index + 1,
            position: Math.max(0, Math.min(rootHeight, clampedBottom)),
          });
        }

        const minTopInset = 32;
        const minBottomInset = 48;
        const midpoint = clampedTop + zoneHeight / 2;
        const safeStart = clampedTop + minTopInset;
        const safeEnd = clampedBottom - minBottomInset;

        let position = midpoint;
        if (!Number.isFinite(position)) {
          position = clampedTop + minTopInset;
        }

        if (safeEnd <= safeStart) {
          position = clampedTop + zoneHeight / 2;
        } else {
          position = Math.min(Math.max(position, safeStart), safeEnd);
        }

        position = Math.max(
          clampedTop,
          Math.min(position, clampedBottom - minBottomInset / 2),
        );

        nextLabels.push({ index: index + 1, position });
      });

      setLines(nextLines);
      setLabels(nextLabels);
    };

    updateLines();

    const resizeObserver = new ResizeObserver(() => updateLines());

    resizeObserver.observe(root);
    const hero = getHero();
    if (hero) {
      resizeObserver.observe(hero);
    }
    getSections().forEach((section) => resizeObserver.observe(section));
    window.addEventListener("resize", updateLines);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, []);

  if (!isDev || (lines.length === 0 && labels.length === 0)) {
    return null;
  }

  return (
    <div className={styles.devOverlay} aria-hidden="true">
      {lines.map((line) => (
        <div
          key={line.index}
          className={styles.devOverlayLine}
          style={{ top: `${line.position}px` }}
        >
        </div>
      ))}
      {labels.map((label) => (
        <span
          key={label.index}
          className={styles.devOverlayLabel}
          style={{ top: `${label.position}px` }}
        >
          {`Dev section ${label.index}`}
        </span>
      ))}
    </div>
  );
}
