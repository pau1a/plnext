
"use client";

import { useState, useTransition, useEffect } from "react";

import { useHotkeys } from "@/hooks/use-hotkeys";

import { approveComment, rejectComment, markAsSpam } from "./actions";
import { CommentHistoryModal } from "./comment-history-modal";
import { CommentItem } from "./comment-item";
import styles from "./comment-list.module.scss";

const DUMMY_COMMENTS = [
  {
    id: "1",
    author: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
    body: "This is a great article! Thanks for sharing.",
    createdAt: "2024-01-01T12:00:00Z",
    status: "pending",
  },
  {
    id: "2",
    author: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    body: "I have a question about the second paragraph. Can you elaborate?",
    createdAt: "2024-01-02T14:30:00Z",
    status: "approved",
  },
  {
    id: "3",
    author: {
      name: "Spam Bot",
      email: "spam@example.com",
    },
    body: "Buy my new product!",
    createdAt: "2024-01-03T10:00:00Z",
    status: "spam",
  },
  {
    id: "4",
    author: {
      name: "Another User",
      email: "another.user@example.com",
    },
    body: "This is a rejected comment.",
    createdAt: "2024-01-04T10:00:00Z",
    status: "rejected",
  },
];

export function CommentList() {
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [focusedComment, setFocusedComment] = useState<string | null>(null);
  const [historyCommentId, setHistoryCommentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useHotkeys("j", () => {
    const index = comments.findIndex((c) => c.id === focusedComment);
    const nextIndex = Math.min(index + 1, comments.length - 1);
    setFocusedComment(comments[nextIndex].id);
  });

  useHotkeys("k", () => {
    const index = comments.findIndex((c) => c.id === focusedComment);
    const prevIndex = Math.max(index - 1, 0);
    setFocusedComment(comments[prevIndex].id);
  });

  useHotkeys("a", () => {
    if (focusedComment) {
      startTransition(() => {
        approveComment(focusedComment);
        setComments((prev) =>
          prev.map((c) =>
            c.id === focusedComment ? { ...c, status: "approved" } : c
          )
        );
      });
    }
  });

  useHotkeys("r", () => {
    if (focusedComment) {
      startTransition(() => {
        rejectComment(focusedComment);
        setComments((prev) =>
          prev.map((c) =>
            c.id === focusedComment ? { ...c, status: "rejected" } : c
          )
        );
      });
    }
  });

  useHotkeys("s", () => {
    if (focusedComment) {
      startTransition(() => {
        markAsSpam(focusedComment);
        setComments((prev) =>
          prev.map((c) =>
            c.id === focusedComment ? { ...c, status: "spam" } : c
          )
        );
      });
    }
  });

  useEffect(() => {
    if (comments.length > 0) {
      setFocusedComment(comments[0].id);
    }
  }, [comments]);

  const handleSelectComment = (id: string) => {
    setSelectedComments((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    startTransition(() => {
      selectedComments.forEach((id) => approveComment(id));
      setComments((prev) =>
        prev.map((c) =>
          selectedComments.includes(c.id) ? { ...c, status: "approved" } : c
        )
      );
      setSelectedComments([]);
    });
  };

  const handleBulkReject = () => {
    startTransition(() => {
      selectedComments.forEach((id) => rejectComment(id));
      setComments((prev) =>
        prev.map((c) =>
          selectedComments.includes(c.id) ? { ...c, status: "rejected" } : c
        )
      );
      setSelectedComments([]);
    });
  };

  const handleBulkMarkAsSpam = () => {
    startTransition(() => {
      selectedComments.forEach((id) => markAsSpam(id));
      setComments((prev) =>
        prev.map((c) =>
          selectedComments.includes(c.id) ? { ...c, status: "spam" } : c
        )
      );
      setSelectedComments([]);
    });
  };

  const handleBulkReturnToPending = () => {
    startTransition(() => {
      setComments((prev) =>
        prev.map((c) =>
          selectedComments.includes(c.id) ? { ...c, status: "pending" } : c
        )
      );
      setSelectedComments([]);
    });
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
      <div className={styles.bulkActions}>
        <button onClick={handleBulkApprove} disabled={isPending || selectedComments.length === 0}>
          Approve Selected
        </button>
        <button onClick={handleBulkReject} disabled={isPending || selectedComments.length === 0}>
          Reject Selected
        </button>
        <button onClick={handleBulkMarkAsSpam} disabled={isPending || selectedComments.length === 0}>
          Mark as Spam
        </button>
        <button onClick={handleBulkReturnToPending} disabled={isPending || selectedComments.length === 0}>
          Return to Pending
        </button>
      </div>
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
      {historyCommentId && (
        <CommentHistoryModal
          commentId={historyCommentId}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  );
}
