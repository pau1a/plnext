
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Comment } from "@/lib/comments/comment";

import { approveComment, rejectComment, markAsSpam } from "./actions";

interface CommentActionsProps {
  comment: Comment;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export function CommentActions({ comment, setComments }: CommentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(
    action: (id: string) => Promise<void>,
    status: Comment["status"],
  ) {
    startTransition(() => {
      action(comment.id)
        .then(() => {
          setComments((prev) =>
            prev.map((c) => (c.id === comment.id ? { ...c, status } : c)),
          );
          router.refresh();
        })
        .catch((error) => {
          console.error("Failed to update comment", error);
        });
    });
  }

  const handleApprove = () => runAction(approveComment, "approved");
  const handleReject = () => runAction(rejectComment, "rejected");
  const handleMarkAsSpam = () => runAction(markAsSpam, "spam");

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
