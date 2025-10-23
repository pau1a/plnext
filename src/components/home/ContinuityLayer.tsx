import clsx from "clsx";
import Image from "next/image";
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

function formatUpdated(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ContinuityLayer({
  className,
  style,
}: HomeSectionProps) {
  const { meta, content } = await getNow();
  const excerpt = extractExcerpt(content);

  if (excerpt.length === 0) {
    return null;
  }

  const updated = formatUpdated(meta.updated);

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
          <figure className={styles.portraitFrame}>
            <div className={styles.portraitHalo} aria-hidden="true" />
            <Image
              src="/media/headshot.webp"
              alt="Paula Livingstone"
              className={styles.portrait}
              width={320}
              height={384}
              sizes="(max-width: 768px) 160px, 240px"
              priority={false}
            />
          </figure>

          <div className={styles.body}>
            <header className={styles.header}>
              <span className={styles.eyebrow}>Continuity layer</span>
              <div className={styles.headerText}>
                <h2 className={styles.heading}>Now</h2>
                {meta.summary ? (
                  <p className={styles.summary}>{meta.summary}</p>
                ) : null}
              </div>
              {updated ? (
                <time className={styles.meta} dateTime={meta.updated}>
                  Updated {updated}
                </time>
              ) : null}
            </header>

            <blockquote className={styles.excerpt}>
              {excerpt.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </blockquote>

            <div className={styles.footer}>
              <Link href="/now" className={styles.cta}>
                See what I’m focused on
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
