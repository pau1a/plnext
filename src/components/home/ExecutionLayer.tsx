import clsx from "clsx";
import Link from "next/link";

import { getProjectSummaries } from "@/lib/mdx";

import homeStyles from "@/styles/home.module.scss";

import styles from "./ExecutionLayer.module.scss";

import type { HomeSectionProps } from "./types";

const PROJECT_LIMIT = 3;

function formatYear(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return String(date.getFullYear());
}

export default async function ExecutionLayer({
  className,
  style,
}: HomeSectionProps) {
  const projects = (await getProjectSummaries()).slice(0, PROJECT_LIMIT);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="section-home-execution"
      className={clsx(
        homeStyles.band,
        homeStyles.bandExecution,
        styles.executionLayer,
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
              <span className={styles.eyebrow}>Execution layer</span>
              <h2 className={styles.heading}>Projects</h2>
              <p className={styles.subheading}>
                Fully shipped engagements where calm engineering met real-world
                constraints.
              </p>
            </div>
            <p className={styles.headerMeta}>
              Selected work across cloud security, automation, and resilience.
            </p>
          </header>

          <div className={styles.grid}>
            {projects.map((project) => {
              const year = formatYear(project.date);

              return (
                <article key={project.slug} className={styles.card}>
                  <span className={styles.cardAccent} aria-hidden="true" />

                  <header className={styles.cardHeader}>
                    <div className={styles.cardMeta}>
                      {year ? (
                        <time className={styles.cardYear} dateTime={project.date}>
                          {year}
                        </time>
                      ) : null}
                      {project.status ? (
                        <span className={styles.cardStatus}>{project.status}</span>
                      ) : null}
                    </div>

                    <h3 className={styles.cardTitle}>
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h3>

                    <p className={styles.cardSummary}>{project.summary}</p>
                  </header>

                  {project.stack && project.stack.length > 0 ? (
                    <ul className={styles.cardStack} aria-label="Technologies">
                      {project.stack.map((item) => (
                        <li key={item} className={styles.cardStackItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    href={`/projects/${project.slug}`}
                    className={styles.cardLink}
                  >
                    View project →
                  </Link>
                </article>
              );
            })}
          </div>

          <div className={styles.footer}>
            <Link href="/projects" className={styles.footerCta}>
              View all projects →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
