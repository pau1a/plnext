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
                <article className={styles.card} key={essay.slug}>
                  <header className="u-stack u-gap-xs">
                    <div className={styles.meta}>
                      <span>{formatDate(essay.date)}</span>
                      <span aria-hidden="true">•</span>
                      <span>/{essay.slug}</span>
                      {essay.featured ? <span className={styles.tag}>Featured</span> : null}
                      {isDraft ? <span className={styles.draft}>{statusLabel}</span> : null}
                    </div>
                    <h2 className="u-heading-md u-font-semibold">{essay.title}</h2>
                    {essay.summary ? (
                      <p className="u-text-muted u-text-sm">{essay.summary}</p>
                    ) : (
                      <p className="u-text-muted u-text-sm">Add a summary in the front matter to help editors scan the backlog.</p>
                    )}
                  </header>

                  <div className={styles.actions}>
                    <Link className="button button--ghost button--sm" href={`/writing/${essay.slug}`}>
                      View live essay
                    </Link>
                    <button className="button button--ghost button--sm" type="button" disabled>
                      Edit content (coming soon)
                    </button>
                    <button className="button button--ghost button--sm" type="button" disabled>
                      Schedule publish
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
