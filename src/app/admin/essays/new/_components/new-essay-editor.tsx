"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createEssayAction } from "../../actions";
import { ensureSlug } from "@/lib/slugify";

const initialEssayActionState = { status: "idle" as const };

export function NewEssayEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [featured, setFeatured] = useState(false);
  const [draft, setDraft] = useState(false);
  const [body, setBody] = useState("");

  const [actionState, formAction] = useActionState(createEssayAction, initialEssayActionState);

  const derivedSlug = useMemo(() => {
    return ensureSlug(title, "");
  }, [title]);

  useEffect(() => {
    if (actionState.status === "success") {
      const timer = setTimeout(() => {
        router.push("/admin/essays");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [actionState.status, router]);

  return (
    <form className="u-stack u-gap-xl" action={formAction}>
      <div className="u-stack u-gap-sm">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap">
          <div className="admin-essay-editor__lead">
            <div className="admin-essay-editor__statbar">
              <div className="admin-essay-editor__statrow">
                <span className="admin-essay-editor__stat">
                  Creating new essay
                </span>
                <span className="admin-essay-editor__stat">
                  Permalink <code>/essays/{derivedSlug || "(auto-generated)"}</code>
                </span>
              </div>
            </div>
          </div>
          <Link className="button button--ghost button--sm" href="/admin/essays">
            Back to list
          </Link>
        </div>
        <p className="u-text-muted u-text-sm">
          Fill in the details below to create a new essay. The file will be saved as an MDX file in <code>content/writing</code>.
        </p>
      </div>

      <input type="hidden" name="slug" value={derivedSlug} />

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Front matter</h3>

        <div className="admin-essay-editor__primary-fields">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="essay-title">
            <span className="admin-essay-editor__field-label">Title</span>
            <input
              id="essay-title"
              type="text"
              name="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Precision in the Loop"
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="essay-date">
            <span className="admin-essay-editor__field-label">Publish date</span>
            <input
              id="essay-date"
              type="date"
              name="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="essay-summary">
            <span className="admin-essay-editor__field-label">Summary</span>
            <textarea
              id="essay-summary"
              name="summary"
              className="input admin-essay-editor__summary-input"
              rows={4}
              placeholder="Single sentence used in listings and previews."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>
        </div>

        <div className="admin-essay-editor__frontmatter-grid">
          <label className="admin-essay-editor__field admin-essay-editor__field--checkbox">
            <div className="admin-essay-editor__checkbox-row">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span className="admin-essay-editor__field-label">Featured</span>
            </div>
            <p className="admin-essay-editor__field-help u-text-muted u-text-xs">
              Show this essay in featured slots around the site.
            </p>
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--checkbox">
            <div className="admin-essay-editor__checkbox-row">
              <input
                type="checkbox"
                name="draft"
                checked={draft}
                onChange={(e) => setDraft(e.target.checked)}
              />
              <span className="admin-essay-editor__field-label">Draft</span>
            </div>
            <p className="admin-essay-editor__field-help u-text-muted u-text-xs">
              Draft essays stay off the public stream.
            </p>
          </label>
        </div>
      </section>

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Essay body</h3>
        <textarea
          name="body"
          className="input admin-essay-editor__textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={28}
          spellCheck="false"
          placeholder="Write your essay content here in Markdown..."
          required
        />
      </section>

      <div className="u-flex u-gap-sm u-items-center u-flex-wrap">
        <SubmitButton />
        {actionState.status === "success" ? (
          <span role="status" className="u-text-sm u-text-accent">
            {actionState.message} Redirecting...
          </span>
        ) : null}
        {actionState.status === "error" ? (
          <span role="alert" className="u-text-sm u-text-error">
            {actionState.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create essay"}
    </button>
  );
}
