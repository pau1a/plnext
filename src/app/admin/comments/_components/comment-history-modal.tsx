"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./comment-history-modal.module.scss";

interface CommentHistoryModalProps {
  commentId: string;
  onClose: () => void;
}

interface HistoryEntry {
  status: "pending" | "approved" | "rejected" | "spam";
  action: string;
  actorName: string | null;
  timestamp: string;
  reason: string | null;
}

export function CommentHistoryModal({ commentId, onClose }: CommentHistoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setHistory(null);
    setError(null);

    fetch(`/api/admin/comments/${commentId}/history`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to load history");
        }
        const payload = (await response.json()) as { entries?: HistoryEntry[] };
        setHistory(payload.entries ?? []);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load history");
      });

    return () => controller.abort();
  }, [commentId]);

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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h3>Comment History</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className={styles.body}>
          {error ? (
            <p className="u-text-error">{error}</p>
          ) : history === null ? (
            <p>Loading…</p>
          ) : history.length === 0 ? (
            <p>No history entries found.</p>
          ) : (
            <ul>
              {history.map((entry) => (
                <li key={`${entry.timestamp}-${entry.action}`}>
                  <div className={styles.eventRow}>
                    <span className={styles.status}>{entry.status}</span>
                    <time dateTime={entry.timestamp}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </time>
                  </div>
                  <div className={styles.meta}>
                    {entry.actorName ? <span>Moderator: {entry.actorName}</span> : null}
                    {entry.reason ? <span>Reason: {entry.reason}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
