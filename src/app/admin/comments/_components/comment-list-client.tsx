"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Comment } from "@/lib/comments/comment";
import { useHotkeys } from "@/hooks/use-hotkeys";

import { approveComment, rejectComment, markAsSpam, returnToPending } from "./actions";
import { CommentHistoryModal } from "./comment-history-modal";
import { CommentItem } from "./comment-item";
import styles from "./comment-list.module.scss";

interface CommentListClientProps {
  initialComments: Comment[];
  error: string | null;
}

export function CommentListClient({ initialComments, error }: CommentListClientProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [focusedComment, setFocusedComment] = useState<string | null>(
    initialComments[0]?.id ?? null,
  );
  const [historyCommentId, setHistoryCommentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setComments(initialComments);
    setSelectedComments([]);
    setFocusedComment(initialComments[0]?.id ?? null);
  }, [initialComments]);

  useHotkeys("j", () => {
    if (comments.length === 0) {
      return;
    }

    const index = comments.findIndex((c) => c.id === focusedComment);
    const currentIndex = index >= 0 ? index : 0;
    const nextIndex = Math.min(currentIndex + 1, comments.length - 1);
    const next = comments[nextIndex];
    setFocusedComment(next ? next.id : null);
  });

  useHotkeys("k", () => {
    if (comments.length === 0) {
      return;
    }

    const index = comments.findIndex((c) => c.id === focusedComment);
    const currentIndex = index >= 0 ? index : 0;
    const prevIndex = Math.max(currentIndex - 1, 0);
    const previous = comments[prevIndex];
    setFocusedComment(previous ? previous.id : null);
  });

  useHotkeys("a", () => {
    if (!focusedComment) {
      return;
    }

    handleModerationAction([focusedComment], "approve");
  });

  useHotkeys("r", () => {
    if (!focusedComment) {
      return;
    }

    handleModerationAction([focusedComment], "reject");
  });

  useHotkeys("s", () => {
    if (!focusedComment) {
      return;
    }

    handleModerationAction([focusedComment], "spam");
  });

  async function handleModerationAction(ids: string[], action: "approve" | "reject" | "spam" | "pending") {
    if (ids.length === 0) {
      return;
    }

    startTransition(() => {
      const operation =
        action === "approve"
          ? approveComment
          : action === "reject"
          ? rejectComment
          : action === "spam"
          ? markAsSpam
          : returnToPending;

      Promise.all(ids.map((id) => operation(id)))
        .then(() => {
          setComments((prev) =>
            prev.map((comment) =>
              ids.includes(comment.id)
                ? {
                    ...comment,
                    status:
                      action === "approve"
                        ? "approved"
                        : action === "reject"
                        ? "rejected"
                        : action === "spam"
                        ? "spam"
                        : "pending",
                  }
                : comment,
            ),
          );
          setSelectedComments([]);
          router.refresh();
        })
        .catch((error) => {
          console.error("Failed to update comments", error);
        });
    });
  }

  const handleSelectComment = (id: string) => {
    setSelectedComments((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleBulkApprove = () => {
    handleModerationAction(selectedComments, "approve");
  };

  const handleBulkReject = () => {
    handleModerationAction(selectedComments, "reject");
  };

  const handleBulkMarkAsSpam = () => {
    handleModerationAction(selectedComments, "spam");
  };

  const handleBulkReturnToPending = () => {
    handleModerationAction(selectedComments, "pending");
  };

  const handleShowHistory = (id: string) => {
    setHistoryCommentId(id);
  };

  const handleCloseHistory = () => {
    setHistoryCommentId(null);
  };

  const handleFocusComment = (id: string) => {
    setFocusedComment(id);
  };

  return (
    <div>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <div className={styles.bulkActions}>
        <button
          onClick={handleBulkApprove}
          disabled={isPending || selectedComments.length === 0}
        >
          Approve Selected
        </button>
        <button
          onClick={handleBulkReject}
          disabled={isPending || selectedComments.length === 0}
        >
          Reject Selected
        </button>
        <button
          onClick={handleBulkMarkAsSpam}
          disabled={isPending || selectedComments.length === 0}
        >
          Mark as Spam
        </button>
        <button
          onClick={handleBulkReturnToPending}
          disabled={isPending || selectedComments.length === 0}
        >
          Return to Pending
        </button>
      </div>
      {comments.length === 0 ? (
        <p className={styles.emptyState}>No comments found.</p>
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isSelected={selectedComments.includes(comment.id)}
              isFocused={focusedComment === comment.id}
              onSelect={handleSelectComment}
              onShowHistory={handleShowHistory}
              onFocus={handleFocusComment}
              setComments={setComments}
            />
          ))}
        </div>
      )}
      {historyCommentId && (
        <CommentHistoryModal commentId={historyCommentId} onClose={handleCloseHistory} />
      )}
    </div>
  );
}
