"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { createLibraryItemAction } from "../actions";
import styles from "../library-form.module.scss";

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
            borderColor: "color-mix(in srgb, var(--admin-status-danger) 75%, transparent)",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--admin-status-danger) 55%, transparent)",
          }
        : undefined,
    };
  };

  return (
    <form ref={formRef} className={styles.form} action={formAction}>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="library-title">
            Title
          </label>
          <input
            id="library-title"
            name="title"
            className="input"
            placeholder="e.g. The Phoenix Project"
            required
            {...errorProps("title")}
          />
          {state.fieldErrors?.title ? (
            <p id="title-error" className={styles.fieldError}>
              {state.fieldErrors.title}
            </p>
          ) : (
            <p className={styles.fieldHelp}>The full title of the book, paper, or talk.</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="library-author">
            Author
          </label>
          <input
            id="library-author"
            name="author"
            className="input"
            placeholder="e.g. Gene Kim"
            required
            {...errorProps("author")}
          />
          {state.fieldErrors?.author ? (
            <p id="author-error" className={styles.fieldError}>
              {state.fieldErrors.author}
            </p>
          ) : (
            <p className={styles.fieldHelp}>Author name or speaker name.</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="library-year">
            Year <span className="u-text-muted">(optional)</span>
          </label>
          <input
            id="library-year"
            name="year"
            className="input"
            placeholder="e.g. 2013"
            inputMode="numeric"
            {...errorProps("year")}
          />
          {state.fieldErrors?.year ? (
            <p id="year-error" className={styles.fieldError}>
              {state.fieldErrors.year}
            </p>
          ) : (
            <p className={styles.fieldHelp}>Publication year if known.</p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="library-link">
          External link <span className="u-text-muted">(optional)</span>
        </label>
        <input
          id="library-link"
          name="link"
          className="input"
          placeholder="https://example.com/article"
          {...errorProps("link")}
        />
        {state.fieldErrors?.link ? (
          <p id="link-error" className={styles.fieldError}>
            {state.fieldErrors.link}
          </p>
        ) : (
          <p className={styles.fieldHelp}>Link to where readers can find this work. Leave blank if not available online.</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="library-note">
          Why it matters <span className="u-text-muted">(optional)</span>
        </label>
        <textarea
          id="library-note"
          name="note"
          className="input"
          rows={4}
          placeholder="Why this work matters to you or what ideas you found valuable."
          {...errorProps("note")}
        />
        {state.fieldErrors?.note ? (
          <p id="note-error" className={styles.fieldError}>
            {state.fieldErrors.note}
          </p>
        ) : (
          <p className={styles.fieldHelp}>Your annotation explaining why you recommend this work.</p>
        )}
      </div>

      <footer className={styles.footer}>
        <SubmitButton />
        {state.status === "success" ? (
          <span role="status" className={`${styles.statusMessage} ${styles.statusSuccess}`}>
            {state.message ?? "Saved."}
          </span>
        ) : null}
        {state.status === "error" && state.message ? (
          <span role="alert" className={`${styles.statusMessage} ${styles.statusError}`}>
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
