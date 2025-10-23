import clsx from "clsx";
import Link from "next/link";
import type { CSSProperties } from "react";

import { getProjectSummaries } from "@/lib/mdx";

import homeStyles from "@/styles/home.module.scss";

import styles from "./ExecutionLayer.module.scss";

import type { HomeSectionProps } from "./types";

const PROJECT_LIMIT = 3;

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

        <header className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
          <p className={styles.caption}>
            Systems that bring disciplined engineering down from the clouds and into
            production.
          </p>
        </header>

        <div className={styles.grid}>
          {projects.map((project, index) => (
            <article
              key={project.slug}
              className={styles.card}
              style={{ "--card-index": index } as CSSProperties}
            >
              <div className={styles.cardMedia} aria-hidden="true">
                <span className={styles.cardSignal} />
              </div>

              <div className={styles.cardBody}>
                <header className={styles.cardHeader}>
                  {project.status ? (
                    <span className={styles.cardStatus}>{project.status}</span>
                  ) : null}
                  <h3 className={styles.cardTitle}>
                    <Link href={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h3>
                </header>

                <p className={styles.cardSummary}>{project.summary}</p>

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
                  <span>Project deep dive</span>
                  <span aria-hidden="true" className={styles.cardLinkArrow}>
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/projects" className={styles.footerCta}>
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
