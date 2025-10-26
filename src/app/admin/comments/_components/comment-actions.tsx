
"use client";

import { useTransition } from "react";

import type { Comment } from "@/lib/comments/comment";

import { approveComment, rejectComment, markAsSpam } from "./actions";

interface CommentActionsProps {
  comment: Comment;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export function CommentActions({ comment, setComments }: CommentActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => {
      approveComment(comment.id);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: "approved" } : c))
      );
    });
  };

  const handleReject = () => {
    startTransition(() => {
      rejectComment(comment.id);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: "rejected" } : c))
      );
    });
  };

  const handleMarkAsSpam = () => {
    startTransition(() => {
      markAsSpam(comment.id);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: "spam" } : c))
      );
    });
  };

  return (
    <div className="comment-actions">
      <button onClick={handleApprove} disabled={isPending || comment.status === "approved"}>
        Approve
      </button>
      <button onClick={handleReject} disabled={isPending || comment.status === "rejected"}>
        Reject
      </button>
      <button onClick={handleMarkAsSpam} disabled={isPending || comment.status === "spam"}>
        Spam
      </button>
    </div>
  );
}
