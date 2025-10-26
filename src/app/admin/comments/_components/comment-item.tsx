
import type { Comment } from "@/lib/comments/comment";

import { CommentActions } from "./comment-actions";
import styles from "./comment-item.module.scss";

interface CommentItemProps {
  comment: Comment;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (id: string) => void;
  onShowHistory: (id: string) => void;
  onFocus: (id: string) => void;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export function CommentItem({ comment, isSelected, isFocused, onSelect, onShowHistory, onFocus, setComments }: CommentItemProps) {
  let statusBarColor = "";
  switch (comment.status) {
    case "pending":
      statusBarColor = "var(--color-amber-500)";
      break;
    case "approved":
      statusBarColor = "var(--color-teal-500)";
      break;
    case "rejected":
      statusBarColor = "var(--color-crimson-500)";
      break;
    case "spam":
      statusBarColor = "var(--color-crimson-700)";
      break;
  }

  return (
    <div
      className={`${styles.item} ${isFocused ? styles.focused : ""}`}
      onClick={() => onFocus(comment.id)}
    >
      <div className={styles.statusBar} style={{ backgroundColor: statusBarColor }} />
      <div className={styles.header}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(comment.id);
          }}
        />
        <div className={styles.author}>{comment.author.name}</div>
        <div className={styles.date}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </div>
        <div className={styles.status}>{comment.status}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowHistory(comment.id);
          }}
        >
          History
        </button>
      </div>
      <div className={styles.body}>{comment.body}</div>
      <div className={styles.actions}>
        <CommentActions comment={comment} setComments={setComments} />
      </div>
    </div>
  );
}
