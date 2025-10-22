"use client";

import { useEffect, useState } from "react";

import styles from "@/styles/dev-overlay.module.scss";

type OverlayLine = {
  index: number;
  position: number;
};

const isDev = process.env.NODE_ENV === "development";

export default function DevSectionOverlay() {
  const [lines, setLines] = useState<OverlayLine[]>([]);

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

    const updateLines = () => {
      const sections = getSections();

      if (sections.length === 0) {
        setLines([]);
        return;
      }

      const rootRectTop = root.getBoundingClientRect().top + window.scrollY;

      const nextLines = sections.slice(0, -1).map((section, index) => {
        const rect = section.getBoundingClientRect();
        const position = rect.bottom + window.scrollY - rootRectTop;

        return { index: index + 1, position } satisfies OverlayLine;
      });

      setLines(nextLines);
    };

    updateLines();

    const resizeObserver = new ResizeObserver(() => updateLines());

    resizeObserver.observe(root);
    getSections().forEach((section) => resizeObserver.observe(section));
    window.addEventListener("resize", updateLines);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, []);

  if (!isDev || lines.length === 0) {
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
          <span className={styles.devOverlayLabel}>{`Dev section ${line.index}`}</span>
        </div>
      ))}
    </div>
  );
}
