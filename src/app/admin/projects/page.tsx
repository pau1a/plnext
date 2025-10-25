import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { formatDate } from "@/lib/date";
import { getProjectSummaries } from "@/lib/mdx";

import styles from "./projects.module.scss";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function AdminProjectsPage() {
  const actor = await requirePermission("audit:read");
  const projects = await getProjectSummaries({ includeDrafts: true });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Projects">
        <section aria-label="Projects inventory" className={styles.grid}>
          {projects.length === 0 ? (
            <p className="u-text-muted">
              No projects found. Add `.mdx` files under <code>content/projects</code> to populate this list.
            </p>
          ) : (
            projects.map((project) => {
              const summary = project.summary?.trim();
              const isDraft = Boolean(project.draft);

              return (
                <article className={styles.row} key={project.fileSlug}>
                  <div className={styles.primary}>
                    <div className={styles.meta}>
                      <span className={styles.date}>{formatDate(project.date)}</span>
                      <span aria-hidden="true">•</span>
                      <span className={styles.slug}>/{project.slug}</span>
                      <span className={`${styles.status} ${isDraft ? styles.statusDraft : ""}`}>
                        {project.status ?? (isDraft ? "Draft" : "Active")}
                      </span>
                    </div>

                    <div className={styles.heading}>
                      <h2 className={styles.title}>{project.title}</h2>
                      {project.stack && project.stack.length > 0 ? (
                        <div className={styles.stack}>
                          {project.stack.map((item) => (
                            <span className={styles.stackItem} key={item}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <p className={styles.summary}>
                      {summary || "Add a summary in the front matter to help editors scan the portfolio."}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Link className="button button--ghost button--xs" href={`/projects/${project.slug}`}>
                      View
                    </Link>
                    <Link className="button button--ghost button--xs" href={`/admin/projects/${project.fileSlug}`}>
                      Edit
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </AdminShell>
    </PageShell>
  );
}
