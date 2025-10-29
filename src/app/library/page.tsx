import Link from "next/link";

import { getLibrary, groupByYear } from "@/lib/library";

import styles from "./library.module.scss";

export const metadata = {
  title: "Library | Paula Livingstone",
  description: "Books, papers, and talks that shaped my thinking.",
  alternates: { canonical: "/library" },
};

export default async function LibraryPage() {
  const items = await getLibrary();

  if (!items.length) {
    return (
      <article className={styles.page}>
        <div className={styles.inner}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.heroEyebrow}>Reference shelf</p>
              <h1 className={styles.heroTitle}>Library</h1>
              <p className={styles.heroSummary}>
                A catalogue-in-progress of the books, lectures, and essays that anchor my practice. Check back soon for
                the first entries.
              </p>
            </div>
          </section>

          <section className={styles.empty}>
            <h2 className={styles.emptyTitle}>Shelves in flux</h2>
            <p className={styles.emptySummary}>
              I&apos;m actively curating the opening selections. Once the first titles are logged, you&apos;ll see the
              reading trail light up here with notes and context for each pick.
            </p>
          </section>
        </div>
      </article>
    );
  }

  const byYear = groupByYear(items);
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
  const newestYear = years[0];
  const oldestYear = years[years.length - 1];
  const uniqueAuthors = new Set(items.map((item) => item.author.toLocaleLowerCase())).size;
  const annotatedCount = items.filter((item) => Boolean(item.note?.trim())).length;
  const latestEntry = items[0];
  const annotationLabel =
    annotatedCount === items.length
      ? "Every entry annotated"
      : `${annotatedCount} annotated picks`;

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Reference shelf</p>
            <h1 className={styles.heroTitle}>Library</h1>
            <p className={styles.heroSummary}>
              A working catalogue of the research, essays, and talks that sharpen judgement. These are the pieces I rely
              on when designing for resilience, risk, and calm operations.
            </p>
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroBadge}>Latest addition · {latestEntry.year}</span>
              <span className={styles.heroBadge}>{annotationLabel}</span>
            </div>
          </div>

          <div className={styles.stats}>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{items.length}</p>
              <p className={styles.statLabel}>Entries catalogued</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statValue}>{uniqueAuthors}</p>
              <p className={styles.statLabel}>Distinct voices</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statValue}>
                {oldestYear === newestYear ? oldestYear : `${oldestYear}–${newestYear}`}
              </p>
              <p className={styles.statLabel}>Year span</p>
            </article>
          </div>
        </section>

        <section className={styles.catalog}>
          <aside className={styles.catalogAside}>
            <span className={styles.catalogLabel}>Browse by year</span>
            <nav className={styles.yearNav}>
              {years.map((year) => (
                <a key={year} href={`#year-${year}`} className={styles.yearLink}>
                  {year}
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className={styles.catalogContent}>
            {years.map((year) => (
              <section key={year} id={`year-${year}`} className={styles.shelf} aria-labelledby={`shelf-${year}`}>
                <header className={styles.shelfHeader}>
                  <h2 id={`shelf-${year}`} className={styles.shelfTitle}>
                    {year}
                  </h2>
                  <span className={styles.shelfMeta}>
                    {byYear[year].length} {byYear[year].length === 1 ? "title" : "titles"}
                  </span>
                </header>
                <div className={styles.itemGrid}>
                  {byYear[year].map((item) => (
                    <article key={`${year}-${item.title}`} className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        {item.link ? (
                          <Link href={item.link} target="_blank" rel="noreferrer">
                            {item.title}
                          </Link>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <span className={styles.cardAuthor}>{item.author}</span>
                      {item.note ? <p className={styles.cardNote}>{item.note}</p> : null}
                      {item.link ? (
                        <div className={styles.cardActions}>
                          <Link href={item.link} target="_blank" rel="noreferrer">
                            Visit source ↗
                          </Link>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
