import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

import { formatDate } from "@/lib/date";
import { getBlogPostSummaries } from "@/lib/mdx";
import { getNow } from "@/lib/now";
import { renderMarkdown } from "@/lib/stream";
import { getEssays } from "@/lib/writing";

import styles from "./now.module.scss";

export const metadata = {
  title: "Now | Paula Livingstone",
  description: "Paula Livingstone's current professional and learning focus.",
};

export const dynamic = "force-static";

export default async function NowPage() {
  const [nowData, essays, blogPosts] = await Promise.all([
    getNow(),
    getEssays({ includeDrafts: false }),
    getBlogPostSummaries({ includeDrafts: false }),
  ]);
  const { meta, content } = nowData;
  const nowContent = nowData.type === "stream" ? await renderMarkdown(content) : <MDXRemote source={content} />;

  const latestEssay = essays[0];
  const latestBlog = blogPosts[0];

  const summaryText =
    typeof meta.summary === "string" && meta.summary.trim().length > 0
      ? meta.summary
      : "What the control room is steering right now—focus, experiments, and the threads being tugged.";

  const pulses = [
    typeof meta.focus === "string" && meta.focus.trim().length > 0
      ? { label: "Focus", value: meta.focus.trim(), variant: "focus" as const }
      : null,
    typeof meta.location === "string" && meta.location.trim().length > 0
      ? { label: "Location", value: meta.location.trim() }
      : null,
    typeof meta.energy === "string" && meta.energy.trim().length > 0
      ? { label: "Energy", value: meta.energy.trim(), variant: "mood" as const }
      : typeof meta.mood === "string" && meta.mood.trim().length > 0
        ? { label: "Mood", value: meta.mood.trim(), variant: "mood" as const }
        : null,
  ].filter(Boolean) as Array<{ label: string; value: string; variant?: "focus" | "mood" }>;

  const signals = [
    latestEssay
      ? {
          type: "essay" as const,
          title: latestEssay.title,
          href: `/essays/${latestEssay.slug}`,
          date: formatDate(latestEssay.date),
          summary:
            (latestEssay.summary && latestEssay.summary.trim()) ||
            "Latest long-form thinking on operational calm and resilience.",
        }
      : null,
    latestBlog
      ? {
          type: "blog" as const,
          title: latestBlog.title,
          href: `/blog/${latestBlog.slug}`,
          date: formatDate(latestBlog.date),
          summary: latestBlog.description || "A quick dispatch from the engineering desk.",
        }
      : null,
  ].filter(Boolean) as Array<{
    type: "essay" | "blog";
    title: string;
    href: string;
    date: string;
    summary: string;
  }>;

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroHeading}>
            <p className={styles.heroEyebrow}>Status report</p>
            <h1 className={`u-heading-xl ${styles.heroTitle}`}>Now</h1>
            {meta.updated ? (
              <span className={styles.heroMeta}>Updated {formatDate(String(meta.updated))}</span>
            ) : null}
            <p className={styles.heroSummary}>{summaryText}</p>
            {pulses.length > 0 ? (
              <div className={styles.pulseRow}>
                {pulses.map((pulse) => (
                  <span key={`${pulse.label}-${pulse.value}`} className={styles.pulse} data-variant={pulse.variant}>
                    <span className={styles.pulseLabel}>{pulse.label}</span>
                    <span className={styles.pulseValue}>{pulse.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.layout}>
          <div className={`${styles.nowContent} prose`}>{nowContent}</div>

          <aside className={styles.signals} aria-label="Recent signals">
            <div className={styles.signalsHeader}>
              <span className={styles.signalsLabel}>Signal boosts</span>
              <p className={styles.signalsSummary}>
                Fresh drops from the writing desk and field notes worth following while the Now page evolves.
              </p>
            </div>

            {signals.length === 0 ? (
              <p className={styles.signalsSummary}>New essays and blog posts will surface here as they publish.</p>
            ) : (
              signals.map((signal) => (
                <article key={signal.href} className={styles.signalCard}>
                  <span className={styles.signalEyebrow}>{signal.type === "essay" ? "Essay" : "Blog"}</span>
                  <h2 className={styles.signalTitle}>
                    <Link href={signal.href}>{signal.title}</Link>
                  </h2>
                  <span className={styles.signalMeta}>{signal.date}</span>
                  <p className={styles.signalSummary}>{signal.summary}</p>
                  <Link href={signal.href} className={styles.signalAction}>
                    Read the {signal.type}
                  </Link>
                </article>
              ))
            )}
          </aside>
        </section>
      </div>
    </article>
  );
}
