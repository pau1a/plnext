import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { formatDate } from "@/lib/date";
import { getEssays } from "@/lib/writing";

import styles from "./essays.module.scss";

export const metadata: Metadata = {
  title: "Essays",
};

export default async function AdminEssaysPage() {
  const actor = await requirePermission("audit:read");
  const essays = await getEssays({ includeDrafts: true });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Essay management">
        <section aria-label="Essay inventory" className={styles.grid}>
          {essays.length === 0 ? (
            <p className="u-text-muted">No essays found. Add `.mdx` files under `content/writing` to populate this list.</p>
          ) : (
            essays.map((essay) => {
              const isDraft = Boolean(essay.draft);
              const statusLabel = isDraft ? "Draft" : "Published";

              return (
                <article className={styles.row} key={essay.fileSlug}>
                  <div className={styles.primary}>
                    <div className={styles.meta}>
                      <span className={styles.date}>{formatDate(essay.date)}</span>
                      <span aria-hidden="true">•</span>
                      <span className={styles.slug}>/{essay.slug}</span>
                      {essay.featured ? <span className={styles.flag}>Featured</span> : null}
                      <span className={isDraft ? styles.draft : styles.status}>{statusLabel}</span>
                    </div>

                    <h2 className={styles.title}>{essay.title}</h2>

                    <p className={styles.summary}>
                      {essay.summary
                        ? essay.summary
                        : "Add a summary in the front matter to help editors scan the backlog."}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Link className="button button--ghost button--xs" href={`/essays/${essay.slug}`}>
                      View
                    </Link>
                    <Link className="button button--ghost button--xs" href={`/admin/essays/${essay.fileSlug}`}>
                      Edit
                    </Link>
                    <button className="button button--ghost button--xs" type="button" disabled>
                      Schedule
                    </button>
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
