"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bodyRef.current;
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [comment.body]);
  let statusBarColor = "";
  switch (comment.status) {
    case "pending":
      statusBarColor = "var(--admin-status-warning-strong)";
      break;
    case "approved":
      statusBarColor = "var(--admin-status-success-strong)";
      break;
    case "rejected":
      statusBarColor = "var(--admin-status-danger-strong)";
      break;
    case "spam":
      statusBarColor = "var(--admin-status-danger-intense)";
      break;
  }

  return (
    <div
      className={`${styles.item} ${isFocused ? styles.focused : ""}`}
      onClick={() => onFocus(comment.id)}
    >
      <div className={styles.statusBar} style={{ backgroundColor: statusBarColor }} />
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(comment.id);
        }}
      />
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.author}>{comment.author.name}</span>
          <span className={styles.email}>{comment.author.email ?? "No email"}</span>
          <span className={styles.slug}>{comment.slug}</span>
          <span className={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</span>
          <span className={`${styles.status} ${styles[comment.status]}`}>{comment.status.toUpperCase()}</span>
        </div>
        <div
          ref={bodyRef}
          className={`${styles.body} ${!isExpanded ? styles.truncated : ""}`}
        >
          {comment.body}
        </div>
      </div>
      <div className={styles.actions}>
        {isTruncated && (
          <button
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        )}
        <button
          className={styles.historyBtn}
          onClick={(e) => {
            e.stopPropagation();
            onShowHistory(comment.id);
          }}
        >
          History
        </button>
        <CommentActions comment={comment} setComments={setComments} />
      </div>
    </div>
  );
}
