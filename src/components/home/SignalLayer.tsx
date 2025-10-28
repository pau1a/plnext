import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import { getNotes, stripMarkdown, extractFirstImage } from "@/lib/notes";
import { loadStream } from "@/lib/stream";

import homeStyles from "@/styles/home.module.scss";
import styles from "./SignalLayer.module.scss";

import type { HomeSectionProps } from "./types";

type SignalEntry =
  | {
      id: string;
      type: "note";
      href: string;
      title: string;
      summary: string;
      isoDate: string;
      imageUrl?: string | null;
    }
  | {
      id: string;
      type: "stream";
      href: string;
      title: string;
      summary: string;
      isoDate: string;
      imageUrl?: string | null;
    };

const SIGNAL_LIMIT = 8;

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildSignalEntries(
  notes: Awaited<ReturnType<typeof getNotes>>,
  stream: Awaited<ReturnType<typeof loadStream>>,
): SignalEntry[] {
  const noteEntries = notes.map((note) => {
    const baseSummary = note.summary?.trim() || note.title;
    const summary = truncate(baseSummary, 180);
    const imageUrl = extractFirstImage(note.body);

    return {
      id: `note-${note.slug}`,
      type: "note" as const,
      href: `/notes/${note.slug}`,
      title: note.title,
      summary,
      isoDate: note.date,
      imageUrl,
    };
  });

  const streamEntries = stream.map((entry) => {
    const summarySource = stripMarkdown(entry.body);
    const title = truncate(summarySource, 180);
    const imageUrl = extractFirstImage(entry.body);

    return {
      id: `stream-${entry.id}`,
      type: "stream" as const,
      href: `/stream${entry.anchor}`,
      title,
      summary: title,
      isoDate: entry.timestamp,
      imageUrl,
    };
  });

  return [...noteEntries, ...streamEntries]
    .sort(
      (a, b) =>
        new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime(),
    )
    .slice(0, SIGNAL_LIMIT);
}

export default async function SignalLayer({
  className,
  style,
}: HomeSectionProps) {
  const [notes, stream] = await Promise.all([
    getNotes({ includeDrafts: false }),
    loadStream(),
  ]);

  const signalEntries = buildSignalEntries(notes, stream);

  if (signalEntries.length === 0) {
    return null;
  }

  return (
    <section
      id="section-home-signals"
      className={clsx(
        homeStyles.band,
        homeStyles.bandSignals,
        styles.signalLayer,
        className,
      )}
      data-home-section
      style={style}
    >
      <div className={clsx(homeStyles.bandInner, styles.inner)}>
        <span className={homeStyles.flightLine} aria-hidden="true" />

        <div className={styles.panel}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>Signal layer</span>
            <h2 className={styles.heading}>Latest Activity</h2>
            <p className={styles.subheading}>
              Live updates, quick notes, and half-formed ideas in chronological order.
            </p>
          </header>

          <ol className={styles.signalList}>
            {signalEntries.map((entry) => (
              <li key={entry.id} className={styles.signalItem}>
                <article
                  className={clsx(
                    styles.signalCard,
                    entry.imageUrl && styles.signalCardWithImage,
                  )}
                >
                  <span className={styles.signalMarker} aria-hidden="true" />
                  <div className={styles.signalMeta}>
                    <time
                      dateTime={entry.isoDate}
                      className={styles.signalDate}
                    >
                      {formatDate(entry.isoDate, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span
                      className={clsx(
                        styles.signalType,
                        entry.type === "stream" && styles.signalTypeStream,
                        entry.type === "note" && styles.signalTypeNote,
                      )}
                    >
                      {entry.type === "stream" ? "STREAM" : "NOTE"}
                    </span>
                  </div>
                  <Link href={entry.href} className={styles.signalLink}>
                    {entry.summary}
                  </Link>
                  {entry.imageUrl && (
                    <div className={styles.signalImageContainer}>
                      <Image
                        src={entry.imageUrl}
                        alt=""
                        width={120}
                        height={80}
                        className={styles.signalImage}
                      />
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ol>

          <div className={styles.actions}>
            <Link href="/stream" className={styles.moreLink}>
              View full stream →
            </Link>
            <Link href="/notes" className={styles.moreLink}>
              Browse all notes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
