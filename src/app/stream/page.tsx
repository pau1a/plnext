import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { StreamItem } from "@/components/stream/StreamItem";
import { formatDate } from "@/lib/date";
import { loadStream } from "@/lib/stream";

import styles from "./page.module.scss";

const BASE_PATH = "/stream";

export const metadata: Metadata = {
  title: "Stream | Paula Livingstone",
  description: "Short, timestamped notes. Public subset.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Stream",
    description: "Short, timestamped notes. Public subset.",
    url: BASE_PATH,
  },
  twitter: {
    title: "Stream",
    description: "Short, timestamped notes. Public subset.",
  },
};

export default async function StreamPage() {
  const entries = await loadStream();
  const totalEntries = entries.length;

  const latestTimestamp = entries[0]?.timestamp ?? null;
  const oldestTimestamp = entries[entries.length - 1]?.timestamp ?? null;
  const uniqueTagCount = new Set(entries.flatMap((entry) => entry.tags)).size;

  const spanLabel =
    totalEntries > 1 && oldestTimestamp && latestTimestamp
      ? `${formatDate(oldestTimestamp, "MMM yyyy")} — ${formatDate(latestTimestamp, "MMM yyyy")}`
      : latestTimestamp
        ? formatDate(latestTimestamp, "MMM yyyy")
        : null;

  const heroSummary =
    totalEntries > 0
      ? `Telemetry from the engineering desk—shipping notes, incident learnings, and experiments in play. ${totalEntries} signal${totalEntries === 1 ? "" : "s"} logged so far${
          spanLabel ? ` (${spanLabel})` : ""
        }.`
      : "Telemetry from the engineering desk—shipping notes, incident learnings, and experiments in play. Public updates land here once they clear the log.";

  const stats = [
    { label: "Signals logged", value: totalEntries.toString() },
    uniqueTagCount > 0 ? { label: "Topics touched", value: uniqueTagCount.toString() } : null,
    latestTimestamp ? { label: "Last update", value: formatDate(latestTimestamp) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <PageShell as="main" className="u-pad-block-3xl" outerClassName={styles.main}>
      <div className={styles.inner}>
        <MotionFade>
          <section className={styles.hero}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>
                <Link href="/about" className={styles.backLink}>
                  <span className={styles.backLinkIcon} aria-hidden>
                    ←
                  </span>
                  Back to About
                </Link>
                Telemetry log
              </span>
              <h1 className={`u-heading-xl ${styles.heroTitle}`}>Stream</h1>
              <p className={styles.heroSummary}>{heroSummary}</p>
            </div>
            <div className={styles.heroStats}>
              {stats.map((stat) => (
                <article key={stat.label} className={styles.statCard}>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </article>
              ))}
            </div>
          </section>
        </MotionFade>

        <MotionFade delay={0.08}>
          {totalEntries > 0 ? (
            <section className={styles.timeline} aria-label="Stream entries">
              <ol className={styles.entries}>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <StreamItem entry={entry} />
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <p className={styles.empty}>No public entries yet. The stream wakes soon.</p>
          )}
        </MotionFade>
      </div>
    </PageShell>
  );
}
