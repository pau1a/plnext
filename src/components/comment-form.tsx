"use client";

import clsx from "clsx";
import React, { useId, useMemo, useState } from "react";

import elevatedSurfaceStyles from "./elevated-surface.module.scss";
import { useCommentContext } from "./comment-context";
import styles from "./comment-list.module.scss";

export interface CommentFormProps {
  slug: string;
  className?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function CommentForm({ slug, className }: CommentFormProps) {
  const { addOptimisticComment, resolveOptimisticComment } = useCommentContext();
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submittedAt, setSubmittedAt] = useState(() => new Date().toISOString());
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const honeypotId = useId();

  const isSubmitDisabled = useMemo(() => {
    return status === "submitting" || !author.trim() || !email.trim() || !body.trim();
  }, [author, body, email, status]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const optimisticId = crypto.randomUUID();
    const optimisticCreatedAt = new Date().toISOString();

    addOptimisticComment({
      id: optimisticId,
      author: author.trim(),
      body: body.trim(),
      createdAt: optimisticCreatedAt,
      status: "pending",
    });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          author: author.trim(),
          email: email.trim(),
          body: body.trim(),
          honeypot,
          submittedAt,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Failed to submit comment" }));
        throw new Error(payload?.error ?? "Failed to submit comment");
      }

      resolveOptimisticComment(optimisticId, { status: "success", error: undefined });
      setStatus("success");
      setAuthor("");
      setEmail("");
      setBody("");
      setSubmittedAt(new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit comment";
      resolveOptimisticComment(optimisticId, { status: "error", error: message });
      setStatus("error");
      setErrorMessage(message);
    }
  };

  return (
    <form
      className={clsx(
        elevatedSurfaceStyles.elevatedSurface,
        "u-pad-xl u-stack u-gap-md",
        className,
      )}
      onSubmit={handleSubmit}
      aria-describedby={status === "success" || status === "error" ? "comment-form-status" : undefined}
    >
      <fieldset className="u-stack u-gap-md" disabled={status === "submitting"}>
        <legend className="heading-subtitle">Leave a comment</legend>

        <div className="u-stack u-gap-2xs">
          <label className="u-font-semibold" htmlFor="comment-author">
            Name
          </label>
          <input
            id="comment-author"
            name="author"
            type="text"
            autoComplete="name"
            required
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="input"
          />
        </div>

        <div className="u-stack u-gap-2xs">
          <label className="u-font-semibold" htmlFor="comment-email">
            Email
          </label>
          <input
            id="comment-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
          />
          <p className="u-text-muted u-text-xs">Your email helps us fight spam and will never be displayed.</p>
        </div>

        <div className="u-stack u-gap-2xs">
          <label className="u-font-semibold" htmlFor="comment-body">
            Comment
          </label>
          <textarea
            id="comment-body"
            name="body"
            rows={4}
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="input"
          />
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={honeypotId}>Do not fill</label>
          <input
            id={honeypotId}
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <input type="hidden" name="submittedAt" value={submittedAt} />

        <button className="button" type="submit" disabled={isSubmitDisabled}>
          {status === "submitting" ? "Submitting…" : "Post comment"}
        </button>
      </fieldset>

      <div id="comment-form-status" role="status" aria-live="polite" className="u-text-sm">
        {status === "success" ? "Thanks! Your comment has been received and is awaiting moderation." : null}
        {status === "error" ? errorMessage : null}
      </div>
    </form>
  );
}
