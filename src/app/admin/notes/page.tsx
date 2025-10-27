import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { formatDate } from "@/lib/date";
import { getNotes } from "@/lib/notes";
import { formatTagLabel } from "@/lib/tags";

import styles from "./notes.module.scss";

export const metadata: Metadata = {
  title: "Notes",
};

export default async function AdminNotesPage() {
  const actor = await requirePermission("audit:read");
  const notes = await getNotes({ includeDrafts: true });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Notes">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap" style={{ marginBottom: "1rem" }}>
          <p className="u-text-muted u-text-sm">
            Manage your note entries. Add `.mdx` files under <code>content/notes</code> or create new notes below.
          </p>
          <Link className="button button--sm" href="/admin/notes/new">
            + New Note
          </Link>
        </div>
        <section aria-label="Notes inventory" className={styles.grid}>
          {notes.length === 0 ? (
            <p className="u-text-muted">
              No notes found. Add `.mdx` files under <code>content/notes</code> to populate this list.
            </p>
          ) : (
            notes.map((note) => {
              const summary = note.summary?.trim();
              const isDraft = Boolean(note.draft);

              return (
                <article className={styles.row} key={note.fileSlug}>
                  <div className={styles.primary}>
                    <div className={styles.meta}>
                      <span className={styles.date}>{formatDate(note.date)}</span>
                      <span aria-hidden="true">•</span>
                      <span className={styles.slug}>/{note.slug}</span>
                      {isDraft ? <span className={`${styles.status} ${styles.statusDraft}`}>Draft</span> : null}
                    </div>

                    <div className={styles.heading}>
                      <h2 className={styles.title}>{note.title}</h2>
                      {note.tags && note.tags.length > 0 ? (
                        <div className={styles.tags}>
                          {note.tags.map((tag) => (
                            <span className={styles.tag} key={tag}>
                              {formatTagLabel(tag)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <p className={styles.summary}>
                      {summary || "Add a summary in the front matter to help editors scan the backlog."}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Link className="button button--ghost button--xs" href={`/notes/${note.slug}`}>
                      View
                    </Link>
                    <Link className="button button--ghost button--xs" href={`/admin/notes/${note.fileSlug}`}>
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
