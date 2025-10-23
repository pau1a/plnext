import clsx from "clsx";
import Link from "next/link";

import { getEssays } from "@/lib/writing";

import styles from "./WritingPreview.module.scss";

import type { HomeSectionProps } from "./types";

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
}: HomeSectionProps) {
  const essays = await getEssays();

  if (essays.length === 0) {
    return null;
  }

  const featuredEssay =
    essays.find((essay) => essay.featured) ?? essays[0];
  const supportingEssays = essays
    .filter((essay) => essay.slug !== featuredEssay.slug)
    .slice(0, 2);

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
              <h2 className={styles.heading}>Writing</h2>
              <p className={styles.subheading}>
                Long-form on systems, automation, and practice.
              </p>
            </header>

            <ul className={styles.list}>
              {supportingEssays.map((essay) => (
                <li key={essay.slug} className={styles.listItem}>
                  <div className={styles.listHeader}>
                    <Link
                      href={`/writing/${essay.slug}`}
                      className={styles.listTitle}
                    >
                      {essay.title}
                    </Link>

                    <time
                      dateTime={essay.date}
                      className={styles.listDate}
                    >
                      {formatDate(essay.date)}
                    </time>
                  </div>

                  {essay.summary ? (
                    <p className={styles.listSummary}>{essay.summary}</p>
                  ) : null}
                </li>
              ))}

              <li className={clsx(styles.listItem, styles.listItemCta)}>
                <Link href="/writing" className={styles.listCtaLink}>
                  Browse all essays →
                </Link>
              </li>
            </ul>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.featuredCard}>
              <div className={styles.featuredMeta}>
                <span className={styles.featuredLabel}>Featured essay</span>
                <time
                  dateTime={featuredEssay.date}
                  className={styles.featuredDate}
                >
                  {formatDate(featuredEssay.date)}
                </time>
              </div>

              <Link
                href={`/writing/${featuredEssay.slug}`}
                className={styles.featuredTitle}
              >
                {featuredEssay.title}
              </Link>

              {featuredEssay.summary ? (
                <p className={styles.featuredSummary}>
                  {featuredEssay.summary}
                </p>
              ) : null}

              <Link
                href={`/writing/${featuredEssay.slug}`}
                className={styles.featuredCta}
              >
                Read the essay →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
