import clsx from "clsx";
import Link from "next/link";

import { getNotes, stripMarkdown } from "@/lib/notes";
import { loadStream } from "@/lib/stream";
import { getEssays } from "@/lib/writing";

import homeStyles from "@/styles/home.module.scss";

import styles from "./KnowledgeLayer.module.scss";

import type { HomeSectionProps } from "./types";

type TimelineEntry =
  | {
      id: string;
      type: "note";
      href: string;
      title: string;
      from: string;
      summary: string;
      isoDate: string;
    }
  | {
      id: string;
      type: "stream";
      href: string;
      title: string;
      from: string;
      summary: string;
      isoDate: string;
    };

const TIMELINE_LIMIT = 6;

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

function normaliseEssaySummary(summary?: string) {
  if (!summary) {
    return null;
  }

  const trimmed = summary.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildTimelineEntries(
  notes: Awaited<ReturnType<typeof getNotes>>,
  stream: Awaited<ReturnType<typeof loadStream>>,
): TimelineEntry[] {
  const latestNotes = notes.slice(0, 3).map((note) => {
    const baseSummary = note.summary?.trim() || note.title;
    const summary = truncate(baseSummary, 140);

    return {
      id: `note-${note.slug}`,
      type: "note" as const,
      href: `/notes/${note.slug}`,
      title: note.title,
      from: "Note",
      summary,
      isoDate: note.date,
    };
  });

  const latestStream = stream.slice(0, 3).map((entry) => {
    const summarySource = stripMarkdown(entry.body);
    const title = truncate(summarySource, 140);

    return {
      id: `stream-${entry.id}`,
      type: "stream" as const,
      href: `/stream${entry.anchor}`,
      title,
      from: "Stream",
      summary: title,
      isoDate: entry.timestamp,
    };
  });

  return [...latestNotes, ...latestStream]
    .sort(
      (a, b) =>
        new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime(),
    )
    .slice(0, TIMELINE_LIMIT);
}

export default async function KnowledgeLayer({
  className,
  style,
}: HomeSectionProps) {
  const [essays, notes, stream] = await Promise.all([
    getEssays({ includeDrafts: false }),
    getNotes({ includeDrafts: false }),
    loadStream(),
  ]);

  const featuredEssay =
    essays.find((essay) => essay.featured) ?? essays[0] ?? null;

  const supportingEssays = featuredEssay
    ? essays
        .filter((essay) => essay.slug !== featuredEssay.slug)
        .slice(0, 2)
    : [];

  const timelineEntries = buildTimelineEntries(notes, stream);
  const hasTimeline = timelineEntries.length > 0;
  const featuredSummary = featuredEssay
    ? normaliseEssaySummary(featuredEssay.summary)
    : null;

  if (!featuredEssay && timelineEntries.length === 0) {
    return null;
  }

  return (
    <section
      id="section-home-knowledge"
      className={clsx(
        homeStyles.band,
        homeStyles.bandKnowledge,
        styles.knowledgeLayer,
        className,
      )}
      data-home-section
      style={style}
    >
      <div className={clsx(homeStyles.bandInner, styles.inner)}>
        <span className={homeStyles.flightLine} aria-hidden="true" />

        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Knowledge layer</span>
              <h2 className={styles.heading}>Writing</h2>
              <p className={styles.subheading}>
                Signals from the lab — essays, notes, and stream entries in one
                disciplined feed.
              </p>
            </div>

            {hasTimeline ? (
              <div className={styles.headerAside}>
                <p className={styles.headerAsideLabel}>Latest activity</p>
                <p className={styles.headerAsideCopy}>
                  Notes and live stream updates in chronological order.
                </p>
              </div>
            ) : null}
          </header>

          <div
            className={clsx(
              styles.columns,
              !featuredEssay && styles.columnsCondensed,
            )}
          >
            {featuredEssay ? (
              <div className={styles.writing}>
                <article className={styles.featured}>
                  <div className={styles.featuredMeta}>
                    <span className={styles.featuredLabel}>Featured essay</span>
                    <time
                      dateTime={featuredEssay.date}
                      className={styles.featuredDate}
                    >
                      {formatDate(featuredEssay.date)}
                    </time>
                  </div>

                  <h3 className={styles.featuredTitle}>
                    <Link href={`/writing/${featuredEssay.slug}`}>
                      {featuredEssay.title}
                    </Link>
                  </h3>

                  {featuredSummary ? (
                    <p className={styles.featuredSummary}>{featuredSummary}</p>
                  ) : null}

                  <Link
                    href={`/writing/${featuredEssay.slug}`}
                    className={styles.featuredCta}
                  >
                    Read the essay →
                  </Link>
                </article>

                {supportingEssays.length > 0 ? (
                  <div className={styles.supporting}>
                    <ul className={styles.supportingList}>
                      {supportingEssays.map((essay) => {
                        const summary = normaliseEssaySummary(essay.summary);

                        return (
                          <li key={essay.slug} className={styles.supportingItem}>
                            <div className={styles.supportingMeta}>
                              <time
                                dateTime={essay.date}
                                className={styles.supportingDate}
                              >
                                {formatDate(essay.date, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </time>
                            </div>

                            <h4 className={styles.supportingTitle}>
                              <Link href={`/writing/${essay.slug}`}>
                                {essay.title}
                              </Link>
                            </h4>

                            {summary ? (
                              <p className={styles.supportingSummary}>
                                {summary}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>

                    <div className={styles.actions}>
                      <Link href="/writing" className={styles.moreLink}>
                        Browse all essays →
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {hasTimeline ? (
              <aside className={styles.timeline}>
                <ol className={styles.timelineList}>
                  {timelineEntries.map((entry) => (
                    <li key={entry.id} className={styles.timelineItem}>
                      <span className={styles.timelineMarker} aria-hidden="true" />
                      <article className={styles.timelineCard}>
                        <header className={styles.timelineHeader}>
                          <span className={styles.timelineSource}>
                            {entry.from}
                          </span>
                          <time
                            dateTime={entry.isoDate}
                            className={styles.timelineDate}
                          >
                            {formatDate(entry.isoDate, {
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </header>
                        <Link
                          href={entry.href}
                          className={styles.timelineLink}
                          aria-label={`${entry.from}: ${entry.title}`}
                        >
                          {entry.summary}
                        </Link>
                      </article>
                    </li>
                  ))}
                </ol>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
