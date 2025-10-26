
"use client";

import { useEffect, useRef } from "react";

import styles from "./comment-history-modal.module.scss";

interface CommentHistoryModalProps {
  commentId: string;
  onClose: () => void;
}

const DUMMY_HISTORY = [
  {
    status: "pending",
    timestamp: "2024-01-01T12:00:00Z",
  },
  {
    status: "approved",
    timestamp: "2024-01-01T12:05:00Z",
  },
];

export function CommentHistoryModal({ commentId, onClose }: CommentHistoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const history = DUMMY_HISTORY;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h3>Comment History</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className={styles.body}>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>
                <span>{entry.status}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
