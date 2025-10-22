import Link from "next/link";

import { Prose } from "@/components/notes/Prose";
import { formatDateTime, type StreamEntry } from "@/lib/stream";

import styles from "./StreamItem.module.scss";

type StreamItemProps = {
  entry: StreamEntry;
};

export function StreamItem({ entry }: StreamItemProps) {
  return (
    <article id={entry.id} className={styles.item}>
      <div className={styles.itemInner}>
        <time className={styles.timestamp} dateTime={entry.timestamp}>
          {formatDateTime(entry.timestamp)}
        </time>

        <div className="u-stack u-gap-sm">
          <Prose className={styles.body}>{entry.content}</Prose>

          {entry.tags.length > 0 ? (
            <ul className={styles.tags} aria-label="Tags">
              {entry.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Link
          href={entry.anchor}
          aria-label={`Permalink to entry ${entry.id}`}
          className={styles.anchor}
          prefetch={false}
        >
          #
        </Link>
      </div>
    </article>
  );
}
