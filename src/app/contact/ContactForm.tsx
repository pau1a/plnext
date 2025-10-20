"use client";

// src/app/contact/ContactForm.tsx

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialState } from "./state";
import { sendMessage } from "./send";
import styles from "./contact.module.scss";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button--primary" type="submit" disabled={pending}>
      <i className="fa-solid fa-paper-plane" aria-hidden="true" />
      <span>{pending ? "Sending…" : "SEND IT"}</span>
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(sendMessage, initialState);
  const [loadedAt, setLoadedAt] = useState(() => new Date().toISOString());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLoadedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
    if (state.status === "success" || state.status === "error") {
      setLoadedAt(new Date().toISOString());
    }
  }, [state.status]);

  const errorMessage = state.status === "error" ? state.message : null;
  const showSuccess = state.status === "success";

  return (
    <form ref={formRef} action={formAction} className="form-shell" noValidate>
      <input type="hidden" name="submittedAt" value={loadedAt} readOnly />
      <div aria-live="polite" className="u-stack-sm" role="status">
        {showSuccess && (
          <p className="u-text-success">Message sent. I’ll reply when I can do it properly.</p>
        )}
        {errorMessage && <p className="u-text-danger">{errorMessage}</p>}
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" className="form-field__control" required autoComplete="name" />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-field__control"
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          className="form-field__control"
          rows={5}
          required
        />
      </div>
      <div
        className="sr-only"
        aria-hidden="true"
        style={{ position: "absolute", left: "-100vw", opacity: 0, pointerEvents: "none" }}
      >
        <label htmlFor="company">Company</label>
        <input id="company" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.submitRow}>
        <SubmitButton />
      </div>
      <p className={styles.footerNote}>
        You’re writing to a real person. Machines help, but I answer myself.
      </p>
    </form>
  );
}
