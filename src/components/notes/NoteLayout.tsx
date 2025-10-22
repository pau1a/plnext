import Link from "next/link";
import type { ReactNode } from "react";

import { formatDate } from "@/lib/date";
import type { NoteSummary } from "@/lib/notes";

import { Prose } from "./Prose";
import { TagList } from "./TagList";
import styles from "./note-layout.module.scss";

interface NoteLayoutProps {
  title: string;
  date: string;
  tags?: string[];
  children: ReactNode;
  backHref?: string;
  relatedNotes?: NoteSummary[];
}

export function NoteLayout({
  title,
  date,
  tags,
  children,
  backHref = "/notes",
  relatedNotes,
}: NoteLayoutProps) {
  return (
    <article className={styles.noteArticle}>
      <header className={styles.header}>
        <Link className={styles.backLink} href={backHref}>
          <span aria-hidden="true">←</span>
          <span>Back to notes</span>
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <time className={styles.date} dateTime={date}>
          {formatDate(date)}
        </time>
        <TagList tags={tags} ariaLabel={`Tags for ${title}`} />
      </header>

      <Prose className={styles.body}>{children}</Prose>

      {relatedNotes?.length ? (
        <section className={styles.relatedSection} aria-labelledby="related-notes">
          <h2 id="related-notes" className={styles.relatedHeading}>
            Related notes
          </h2>
          <ul className={styles.relatedList}>
            {relatedNotes.map((note) => (
              <li key={note.slug}>
                <Link className={styles.relatedLink} href={`/notes/${note.slug}`}>
                  {note.title}
                </Link>
                <div className={styles.relatedMeta}>{formatDate(note.date)}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
