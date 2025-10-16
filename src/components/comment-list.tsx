import clsx from "clsx";
import { format } from "date-fns";

import type { BlogPostComment } from "@/lib/mdx";

import styles from "./comment-list.module.scss";

export interface CommentListProps {
  comments?: BlogPostComment[];
  className?: string;
}

function formatCommentDate(value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return format(new Date(timestamp), "MMMM d, yyyy");
}

export function CommentList({ comments = [], className }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className={clsx(styles.emptyState, className)} role="status" aria-live="polite">
        No comments yet. Be the first to share your thoughts.
      </div>
    );
  }

  return (
    <ol className={clsx(styles.list, className)}>
      {comments.map((comment, index) => {
        const formattedDate = formatCommentDate(comment.date);
        const key = `${comment.author}-${comment.date ?? index}`;

        return (
          <li key={key} className={clsx("u-stack u-gap-sm", styles.comment)}>
            <header className={styles.meta}>
              <span className={styles.author}>{comment.author}</span>
              {comment.role ? <span className={styles.role}>{comment.role}</span> : null}
              {formattedDate ? (
                <time className={styles.date} dateTime={comment.date} aria-label="Comment date">
                  {formattedDate}
                </time>
              ) : null}
            </header>
            <p className={styles.body}>{comment.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
