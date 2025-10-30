import clsx from "clsx";
import Link from "next/link";

import { formatDate } from "@/lib/date";
import type { NoteSummary } from "@/lib/notes";

import { TagList } from "./TagList";
import styles from "./note-item.module.scss";

interface NoteItemProps {
  note: NoteSummary;
  className?: string;
}

export function NoteItem({ note, className }: NoteItemProps) {
  return (
    <article className={clsx(styles.noteItem, className)}>
      <h2 className={styles.title}>
        <Link className={styles.link} href={`/notes/${note.slug}`}>
          {note.title}
        </Link>
      </h2>
      <time className={styles.date} dateTime={note.date}>
        {formatDate(note.date)}
      </time>
      {note.summary ? (
        <p className={clsx(styles.summary, "u-max-w-prose")}>{note.summary}</p>
      ) : null}
      <TagList
        tags={note.tags}
        ariaLabel={`Tags for ${note.title}`}
        className={styles.tags}
      />
    </article>
  );
}
