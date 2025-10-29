"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { createLibraryItemAction } from "../actions";

type LibraryFormState = Awaited<ReturnType<typeof createLibraryItemAction>>;

const initialState: LibraryFormState = {
  status: "idle",
};

export function LibraryItemForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(createLibraryItemAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus();
    }
  }, [state.status]);

  const errorProps = (field: keyof NonNullable<LibraryFormState["fieldErrors"]>) => {
    const message = state.fieldErrors?.[field];
    return {
      "aria-invalid": message ? "true" : undefined,
      "aria-describedby": message ? `${field}-error` : undefined,
      style: message
        ? {
            borderColor: "color-mix(in srgb, var(--color-crimson-400) 75%, transparent)",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-crimson-400) 55%, transparent)",
          }
        : undefined,
    };
  };

  return (
    <form ref={formRef} className="u-stack u-gap-lg" action={formAction}>
      <div className="admin-essay-editor__frontmatter-grid">
        <div className="u-stack u-gap-2xs">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="library-title">
            <span className="admin-essay-editor__field-label">Title</span>
            <input
              id="library-title"
              name="title"
              className="input"
              placeholder="Designing Data-Intensive Applications"
              required
              {...errorProps("title")}
            />
          </label>
          {state.fieldErrors?.title ? (
            <p id="title-error" className="admin-essay-editor__field-help u-text-xs u-text-error">
              {state.fieldErrors.title}
            </p>
          ) : (
            <p className="admin-essay-editor__field-help u-text-xs u-text-muted">
              Books, papers, talks—anything worth curating.
            </p>
          )}
        </div>

        <div className="u-stack u-gap-2xs">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="library-author">
            <span className="admin-essay-editor__field-label">Author</span>
            <input
              id="library-author"
              name="author"
              className="input"
              placeholder="Martin Kleppmann"
              required
              {...errorProps("author")}
            />
          </label>
          {state.fieldErrors?.author ? (
            <p id="author-error" className="admin-essay-editor__field-help u-text-xs u-text-error">
              {state.fieldErrors.author}
            </p>
          ) : (
            <p className="admin-essay-editor__field-help u-text-xs u-text-muted">
              Use primary authors or speakers so attribution stays clean.
            </p>
          )}
        </div>

        <div className="u-stack u-gap-2xs">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="library-year">
            <span className="admin-essay-editor__field-label">Year</span>
            <input
              id="library-year"
              name="year"
              className="input"
              placeholder="2017"
              inputMode="numeric"
              required
              {...errorProps("year")}
            />
          </label>
          {state.fieldErrors?.year ? (
            <p id="year-error" className="admin-essay-editor__field-help u-text-xs u-text-error">
              {state.fieldErrors.year}
            </p>
          ) : (
            <p className="admin-essay-editor__field-help u-text-xs u-text-muted">
              Four digits or the year that best associates the work.
            </p>
          )}
        </div>
      </div>

      <div className="u-stack u-gap-2xs">
        <label className="admin-essay-editor__field" htmlFor="library-link">
          <span className="admin-essay-editor__field-label">
            External link <span className="u-text-muted">(optional)</span>
          </span>
          <input
            id="library-link"
            name="link"
            className="input"
            placeholder="https://example.com/article"
            {...errorProps("link")}
          />
        </label>
        {state.fieldErrors?.link ? (
          <p id="link-error" className="admin-essay-editor__field-help u-text-xs u-text-error">
            {state.fieldErrors.link}
          </p>
        ) : (
          <p className="admin-essay-editor__field-help u-text-xs u-text-muted">
            Provide canonical URLs. Leave blank for offline-only works.
          </p>
        )}
      </div>

      <div className="u-stack u-gap-2xs">
        <label className="admin-essay-editor__field" htmlFor="library-note">
          <span className="admin-essay-editor__field-label">
            Why it matters <span className="u-text-muted">(optional)</span>
          </span>
          <textarea
            id="library-note"
            name="note"
            className="input"
            rows={4}
            placeholder="One or two lines on the ideas you keep coming back to."
            {...errorProps("note")}
          />
        </label>
        {state.fieldErrors?.note ? (
          <p id="note-error" className="admin-essay-editor__field-help u-text-xs u-text-error">
            {state.fieldErrors.note}
          </p>
        ) : (
          <p className="admin-essay-editor__field-help u-text-xs u-text-muted">
            Optional but helpful context for future you (and readers).
          </p>
        )}
      </div>

      <footer className="u-flex u-gap-sm u-items-center u-flex-wrap">
        <SubmitButton />
        {state.status === "success" ? (
          <span role="status" className="u-text-sm u-text-accent">
            {state.message ?? "Saved."}
          </span>
        ) : null}
        {state.status === "error" && state.message ? (
          <span role="alert" className="u-text-sm u-text-error">
            {state.message}
          </span>
        ) : null}
      </footer>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? "Saving…" : "Save item"}
    </button>
  );
}
