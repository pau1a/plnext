import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { getLibrary } from "@/lib/library";

import styles from "./library.module.scss";

export const metadata: Metadata = {
  title: "Library",
};

export default async function AdminLibraryPage() {
  const actor = await requirePermission("audit:read");
  const items = await getLibrary();

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Library">
        <div className="u-flex u-gap-sm u-justify-between u-items-center u-flex-wrap">
          <p className="u-text-muted u-text-sm">
            Curate reading recommendations and references that surface on the public library page.
          </p>
          <Link className="button button--sm" href="/admin/library/new">
            + Add Item
          </Link>
        </div>

        <section aria-label="Library catalogue" className={styles.grid}>
          {items.length === 0 ? (
            <p className={styles.empty}>
              Nothing logged yet. Add your first book, paper, or talk using the button above.
            </p>
          ) : (
            items.map((item) => (
              <article className={styles.card} key={`${item.year}-${item.title}`}>
                <header className={styles.header}>
                  <h2 className={styles.title}>{item.title}</h2>
                  <span className={styles.author}>{item.author}</span>
                </header>
                <div className={styles.meta}>
                  <span>{item.year}</span>
                  {item.link ? (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>Linked resource available</span>
                    </>
                  ) : null}
                </div>
                {item.note ? <p className={styles.note}>{item.note}</p> : null}
                {item.link ? (
                  <div className={styles.ctaRow}>
                    <Link className="button button--ghost button--xs" href={item.link} target="_blank" rel="noreferrer">
                      Open link
                    </Link>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </section>
      </AdminShell>
    </PageShell>
  );
}
