import clsx from "clsx";
import Link from "next/link";

import { getNow } from "@/lib/now";
import { stripMarkdown } from "@/lib/notes";

import homeStyles from "@/styles/home.module.scss";

import styles from "./ContinuityLayer.module.scss";

import type { HomeSectionProps } from "./types";

function extractExcerpt(body: string): string[] {
  const chunks = body
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (chunks.length === 0) {
    return [];
  }

  return chunks.map((chunk) => stripMarkdown(chunk));
}

export default async function ContinuityLayer({
  className,
  style,
}: HomeSectionProps) {
  const { meta, content } = await getNow();
  const excerpt = extractExcerpt(content);
  const tileCandidates: Array<{ label: string; body: string }> = [];

  if (meta.summary) {
    tileCandidates.push({ label: "Primary focus", body: meta.summary });
  }

  excerpt.forEach((paragraph, index) => {
    tileCandidates.push({
      label: `Stream 0${index + 1}`,
      body: paragraph,
    });
  });

  const fallbackTiles = [
    { label: "Space to think", body: "Room left intentionally clear for emerging work." },
    { label: "Signals", body: "Listening for patterns across teams and partners." },
    { label: "Momentum", body: "Keeping energy on the projects that matter most." },
  ];

  const intentTiles: Array<{ label: string; body: string }> = [];

  tileCandidates.forEach((tile) => {
    if (intentTiles.length < 4) {
      intentTiles.push(tile);
    }
  });

  let fallbackIndex = 0;
  while (intentTiles.length < 4) {
    intentTiles.push(fallbackTiles[fallbackIndex % fallbackTiles.length]);
    fallbackIndex += 1;
  }

  if (excerpt.length === 0) {
    return null;
  }

  return (
    <section
      id="section-home-continuity"
      className={clsx(
        homeStyles.band,
        homeStyles.bandContinuity,
        styles.continuityLayer,
        className,
      )}
      data-home-section
      style={style}
    >
      <div className={clsx(homeStyles.bandInner, styles.inner)}>
        <span className={homeStyles.flightLine} aria-hidden="true" />

        <div className={styles.panel}>
          <aside className={styles.intentColumn}>
            <div className={styles.intentGrid}>
              {intentTiles.map((tile, index) => (
                <div
                  key={`${tile.label}-${index}`}
                  className={clsx(
                    styles.intentTile,
                    index === 0 && styles.intentTileActive,
                  )}
                >
                  <span className={styles.intentLabel}>{tile.label}</span>
                  <p className={styles.intentBody}>{tile.body}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className={styles.body}>
            <header className={styles.header}>
              <span className={styles.eyebrow}>Continuity layer</span>
              <div className={styles.headerText}>
                <h2 className={styles.heading}>Now</h2>
                {meta.summary ? (
                  <p className={clsx(styles.summary, "u-max-w-prose")}>
                    {meta.summary}
                  </p>
                ) : null}
              </div>
            </header>

            <ul className={styles.focusList} aria-label="Current focus">
              {excerpt.map((paragraph, index) => (
                <li key={index} className={styles.focusCard}>
                  <span className={styles.focusIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{paragraph}</p>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <Link href="/now" className={styles.cta}>
                <span className={styles.ctaLabel}>See what I’m focused on</span>
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
