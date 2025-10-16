"use client";

import clsx from "clsx";
import { format } from "date-fns";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCommentContext } from "./comment-context";
import styles from "./comment-list.module.scss";

export interface CommentListProps {
  slug: string;
  className?: string;
}

interface CommentPayload {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

interface CommentResponse {
  comments: CommentPayload[];
  nextCursor: string | null;
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

export function CommentList({ slug, className }: CommentListProps) {
  const { optimisticComments, removeOptimisticComment } = useCommentContext();
  const [comments, setComments] = useState<CommentPayload[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (after: string | null, { append }: { append: boolean }) => {
      const controller = new AbortController();
      if (!append) {
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;
        setLoadingInitial(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const searchParams = new URLSearchParams({ slug });
        if (after) {
          searchParams.set("after", after);
        }

        const response = await fetch(`/api/comments?${searchParams.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "Failed to load comments" }));
          throw new Error(payload?.error ?? "Failed to load comments");
        }

        const payload = (await response.json()) as CommentResponse;

        setComments((previous) => (append ? [...previous, ...payload.comments] : payload.comments));
        setNextCursor(payload.nextCursor);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : "Failed to load comments";
        setError(message);
      } finally {
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    fetchPage(null, { append: false });

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchPage]);

  useEffect(() => {
    const successfulOptimisticIds = optimisticComments
      .filter((comment) => comment.status === "success")
      .map((comment) => comment.id);

    if (successfulOptimisticIds.length > 0) {
      const timeout = window.setTimeout(() => {
        successfulOptimisticIds.forEach((id) => removeOptimisticComment(id));
      }, 4_000);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [optimisticComments, removeOptimisticComment]);

  const hasNoComments = comments.length === 0 && optimisticComments.length === 0;

  const optimisticList = useMemo(() => {
    return optimisticComments.map((comment) => ({
      ...comment,
      formattedDate: formatCommentDate(comment.createdAt),
    }));
  }, [optimisticComments]);

  const resolvedComments = useMemo(() => {
    return comments.map((comment) => ({
      ...comment,
      formattedDate: formatCommentDate(comment.createdAt),
    }));
  }, [comments]);

  if (loadingInitial) {
    return (
      <div className={clsx(styles.emptyState, className)} role="status" aria-live="polite">
        Loading comments…
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.emptyState, className)} role="alert">
        <p className="u-text-md u-font-semibold">We couldn&apos;t load the comments.</p>
        <p className="u-text-sm u-text-muted">{error}</p>
        <button type="button" className="button" onClick={() => fetchPage(null, { append: false })}>
          Try again
        </button>
      </div>
    );
  }

  if (hasNoComments) {
    return (
      <div className={clsx(styles.emptyState, className)} role="status" aria-live="polite">
        No comments yet. Be the first to share your thoughts.
      </div>
    );
  }

  return (
    <div className={clsx("u-stack u-gap-md", className)}>
      <ol className={styles.list}>
        {optimisticList.map((comment) => (
          <li key={comment.id} className={clsx("u-stack u-gap-sm", styles.comment, styles.optimistic)}>
            <header className={styles.meta}>
              <span className={styles.author}>{comment.author}</span>
              {comment.formattedDate ? (
                <time className={styles.date} dateTime={comment.createdAt} aria-label="Comment date">
                  {comment.formattedDate}
                </time>
              ) : null}
            </header>
            <p className={styles.body}>{comment.body}</p>
            <p
              className={clsx(
                styles.pendingStatus,
                comment.status === "error" ? styles.pendingError : undefined,
              )}
            >
              {comment.status === "pending"
                ? "Submitting your comment…"
                : comment.status === "success"
                ? "Thanks! Your comment is awaiting moderation."
                : comment.error ?? "We couldn’t submit your comment."}
            </p>
          </li>
        ))}

        {resolvedComments.map((comment) => (
          <li key={comment.id} className={clsx("u-stack u-gap-sm", styles.comment)}>
            <header className={styles.meta}>
              <span className={styles.author}>{comment.author}</span>
              {comment.formattedDate ? (
                <time className={styles.date} dateTime={comment.createdAt} aria-label="Comment date">
                  {comment.formattedDate}
                </time>
              ) : null}
            </header>
            <p className={styles.body}>{comment.body}</p>
          </li>
        ))}
      </ol>

      {nextCursor ? (
        <div className="u-inline-flex u-items-center u-justify-center">
          <button
            type="button"
            className="button"
            onClick={() => fetchPage(nextCursor, { append: true })}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
