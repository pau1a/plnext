import clsx from "clsx";
import Link from "next/link";

import { getNotes } from "@/lib/notes";

import styles from "./WritingPreview.module.scss";

import type { HomeSectionProps } from "./types";

type WritingPreviewProps = HomeSectionProps;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function WritingPreview({
  className,
  style,
}: WritingPreviewProps) {
  const notes = (await getNotes()).filter((note) => !note.draft).slice(0, 3);

  if (notes.length === 0) {
    return null;
  }

  const [featured, ...remaining] = notes;
  const entries = [featured, ...remaining];

  return (
    <section
      id="section-home-writingpreview"
      className={clsx(styles.section, className)}
      data-home-section
      style={style}
    >
      <div className={styles.frame} aria-hidden="true">
        <span className={clsx(styles.frameBar, styles.frameBarTop)} />
        <span className={clsx(styles.frameBar, styles.frameBarBottom)} />
      </div>

      <div className={styles.inner}>
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <header className={styles.header}>
              <h2 className={styles.heading}>Writing &amp; Notes</h2>
              <p className={styles.subheading}>
                Signals from work in progress — systems, automation, and the edges of AI.
              </p>
            </header>

            <ul className={styles.list}>
              {entries.map((note) => (
                <li key={note.slug} className={styles.listItem}>
                  <div className={styles.listMeta}>
                    <time dateTime={note.date} className={styles.date}>
                      {formatDate(note.date)}
                    </time>
                  </div>

                  <Link href={`/notes/${note.slug}`} className={styles.listTitle}>
                    {note.title}
                  </Link>

                  {note.summary ? (
                    <p className={styles.listSummary}>{note.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className={styles.ctaRow}>
              <Link href="/notes" className={styles.ctaLink}>
                Read all notes →
              </Link>
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.featuredCard}>
              <div className={styles.featuredEyebrow}>Featured</div>

              <Link href={`/notes/${featured.slug}`} className={styles.featuredTitle}>
                {featured.title}
              </Link>

              {featured.summary ? (
                <blockquote className={styles.featuredExcerpt}>
                  {featured.summary}
                </blockquote>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
