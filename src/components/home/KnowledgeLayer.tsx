import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import { getEssays } from "@/lib/writing";
import { getBlogPostSummaries } from "@/lib/mdx";
import { extractFirstImage } from "@/lib/notes";

import homeStyles from "@/styles/home.module.scss";

import styles from "./KnowledgeLayer.module.scss";

import type { HomeSectionProps } from "./types";

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

function normaliseDescription(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function KnowledgeLayer({
  className,
  style,
}: HomeSectionProps) {
  const [essays, blogPosts] = await Promise.all([
    getEssays({ includeDrafts: false }),
    getBlogPostSummaries({ includeDrafts: false }),
  ]);

  const featuredEssay =
    essays.find((essay) => essay.featured) ?? essays[0] ?? null;

  const supportingEssays = featuredEssay
    ? essays
        .filter((essay) => essay.slug !== featuredEssay.slug)
        .slice(0, 2)
    : [];

  const featuredSummary = featuredEssay
    ? normaliseEssaySummary(featuredEssay.summary)
    : null;

  const featuredImageUrl = featuredEssay ? extractFirstImage(featuredEssay.body) : null;

  const blogHighlights = blogPosts.slice(0, 3);

  const publishedDates = [
    featuredEssay?.date,
    ...supportingEssays.map((essay) => essay.date),
    ...blogHighlights.map((post) => post.date),
  ].filter((date): date is string => Boolean(date));

  const latestUpdateDate =
    publishedDates.length > 0
      ? publishedDates
          .slice()
          .sort(
            (a, b) =>
              new Date(b).getTime() - new Date(a).getTime(),
          )[0]
      : null;

  const totalPieces = essays.length + blogPosts.length;

  const pulseHero = latestUpdateDate
    ? {
        label: "Last updated",
        value: formatDate(latestUpdateDate, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
    : totalPieces > 0
      ? {
          label: "Published pieces",
          value: totalPieces.toString(),
        }
      : null;

  const pulseMetrics = [
    essays.length > 0 && {
      label: "Essays",
      value: essays.length.toString(),
    },
    blogPosts.length > 0 && {
      label: "Blog posts",
      value: blogPosts.length.toString(),
    },
  ].filter(
    (metric): metric is { label: string; value: string } => Boolean(metric),
  );

  if (!featuredEssay && supportingEssays.length === 0 && blogHighlights.length === 0) {
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
            <div className={styles.headerIntro}>
              <span className={styles.eyebrow}>Knowledge layer</span>
              <h2 className={styles.heading}>Writing</h2>
              <p className={styles.subheading}>
                Polished essays, blog posts, and long-form analysis on security,
                systems, and engineering.
              </p>

              <div className={styles.headerActions}>
                <Link href="/writing" className={styles.headerLink}>
                  Visit the writing room →
                </Link>
                <Link href="/blog" className={styles.headerLink}>
                  Catch up on the blog →
                </Link>
              </div>
            </div>

            {(pulseHero || pulseMetrics.length > 0) && (
              <aside className={styles.headerPulse}>
                <span className={styles.pulseEyebrow}>Knowledge pulse</span>
                {pulseHero ? (
                  <div className={styles.pulseHero}>
                    <span className={styles.pulseHeroValue}>
                      {pulseHero.value}
                    </span>
                    <span className={styles.pulseHeroLabel}>
                      {pulseHero.label}
                    </span>
                  </div>
                ) : null}
                {pulseMetrics.length > 0 ? (
                  <ul className={styles.pulseGrid}>
                    {pulseMetrics.map((metric) => (
                      <li key={metric.label} className={styles.pulseMetric}>
                        <span className={styles.pulseMetricValue}>
                          {metric.value}
                        </span>
                        <span className={styles.pulseMetricLabel}>
                          {metric.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className={styles.pulseSummary}>
                  {latestUpdateDate
                    ? "Rhythm of deep dives and quick dispatches."
                    : "Fresh thinking, delivered steadily."}
                </p>
              </aside>
            )}
          </header>

          <div className={styles.writing}>
            {featuredEssay ? (
              <article
                className={clsx(
                  styles.spotlight,
                  featuredImageUrl && styles.spotlightWithImage,
                )}
              >
                <div className={styles.spotlightContent}>
                  <div className={styles.spotlightMeta}>
                    <span className={styles.spotlightLabel}>Essay spotlight</span>
                    <time
                      dateTime={featuredEssay.date}
                      className={styles.spotlightDate}
                    >
                      {formatDate(featuredEssay.date)}
                    </time>
                  </div>

                  <h3 className={styles.spotlightTitle}>
                    <Link href={`/writing/${featuredEssay.slug}`}>
                      {featuredEssay.title}
                    </Link>
                  </h3>

                  {featuredSummary ? (
                    <p className={styles.spotlightSummary}>{featuredSummary}</p>
                  ) : null}

                  <Link
                    href={`/writing/${featuredEssay.slug}`}
                    className={styles.spotlightCta}
                  >
                    Dive into the essay →
                  </Link>
                </div>

                {featuredImageUrl ? (
                  <div className={styles.spotlightImageContainer}>
                    <Image
                      src={featuredImageUrl}
                      alt=""
                      width={280}
                      height={190}
                      className={styles.spotlightImage}
                    />
                  </div>
                ) : null}
              </article>
            ) : null}

            <div className={styles.columns}>
              {supportingEssays.length > 0 ? (
                <section className={styles.essayShelf}>
                  <header className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>More essays</h3>
                    <Link href="/writing" className={styles.sectionLink}>
                      View essay archive →
                    </Link>
                  </header>

                  <ul className={styles.essayList}>
                    {supportingEssays.map((essay) => {
                      const summary = normaliseEssaySummary(essay.summary);

                      return (
                        <li key={essay.slug} className={styles.essayItem}>
                          <time
                            dateTime={essay.date}
                            className={styles.essayDate}
                          >
                            {formatDate(essay.date, {
                              month: "short",
                              day: "numeric",
                            })}
                          </time>

                          <h4 className={styles.essayTitle}>
                            <Link href={`/writing/${essay.slug}`}>
                              {essay.title}
                            </Link>
                          </h4>

                          {summary ? (
                            <p className={styles.essaySummary}>{summary}</p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {blogHighlights.length > 0 ? (
                <section className={styles.blogShowcase}>
                  <header className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Latest from the blog</h3>
                    <Link href="/blog" className={styles.sectionLink}>
                      Explore the blog →
                    </Link>
                  </header>

                  <ul className={styles.blogList}>
                    {blogHighlights.map((post) => {
                      const description = normaliseDescription(post.description);

                      return (
                        <li key={post.slug} className={styles.blogItem}>
                          <div className={styles.blogMeta}>
                            <span className={styles.blogBadge}>Blog</span>
                            <time
                              dateTime={post.date}
                              className={styles.blogDate}
                            >
                              {formatDate(post.date, {
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>

                          <h4 className={styles.blogTitle}>
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h4>

                          {description ? (
                            <p className={styles.blogSummary}>{description}</p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
