import clsx from "clsx";
import type { ReactNode } from "react";

import type { NoteSummary } from "@/lib/notes";

import { NoteItem } from "./NoteItem";
import styles from "./note-list.module.scss";

interface NoteListProps {
  notes: NoteSummary[];
  className?: string;
  emptyState?: ReactNode;
}

export function NoteList({ notes, className, emptyState }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className={clsx(styles.wrapper, className)}>
        <p className={styles.emptyState}>
          {emptyState ?? "Notes will appear here soon."}
        </p>
      </div>
    );
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.noteList}>
        {notes.map((note) => (
          <NoteItem key={note.slug} note={note} />
        ))}
      </div>
    </div>
  );
}
