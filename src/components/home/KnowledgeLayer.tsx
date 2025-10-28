import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import { getEssays } from "@/lib/writing";
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


export default async function KnowledgeLayer({
  className,
  style,
}: HomeSectionProps) {
  const essays = await getEssays({ includeDrafts: false });

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

  if (!featuredEssay) {
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
            <span className={styles.eyebrow}>Knowledge layer</span>
            <h2 className={styles.heading}>Writing</h2>
            <p className={styles.subheading}>
              Polished essays, blog posts, and long-form analysis on security,
              systems, and engineering.
            </p>
          </header>

          <div className={styles.writing}>
            <article className={styles.featured}>
                  {featuredImageUrl && (
                    <div className={styles.featuredImageContainer}>
                      <Image
                        src={featuredImageUrl}
                        alt=""
                        width={240}
                        height={160}
                        className={styles.featuredImage}
                      />
                    </div>
                  )}
                  <div className={styles.featuredContent}>
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
                  </div>
                </article>

            {supportingEssays.length > 0 ? (
              <div className={styles.supporting}>
                <ul className={styles.supportingList}>
                  {supportingEssays.map((essay) => {
                    const summary = normaliseEssaySummary(essay.summary);
                    const imageUrl = extractFirstImage(essay.body);

                    return (
                      <li key={essay.slug} className={styles.supportingItem}>
                        {imageUrl && (
                          <div className={styles.supportingImageContainer}>
                            <Image
                              src={imageUrl}
                              alt=""
                              width={80}
                              height={54}
                              className={styles.supportingImage}
                            />
                          </div>
                        )}
                        <div className={styles.supportingContent}>
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
                        </div>
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
        </div>
      </div>
    </section>
  );
}
