"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createProjectAction } from "../../actions";
import { ensureSlug } from "@/lib/slugify";

const initialProjectActionState = { status: "idle" as const };

export function NewProjectEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [stack, setStack] = useState("");
  const [draft, setDraft] = useState(true);
  const [body, setBody] = useState("");

  const [actionState, formAction] = useActionState(createProjectAction, initialProjectActionState);

  const derivedSlug = useMemo(() => {
    return ensureSlug(title, "");
  }, [title]);

  useEffect(() => {
    if (actionState.status === "success") {
      const timer = setTimeout(() => {
        router.push("/admin/projects");
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
                  Creating new project
                </span>
                <span className="admin-essay-editor__stat">
                  Permalink <code>/projects/{derivedSlug || "(auto-generated)"}</code>
                </span>
              </div>
            </div>
          </div>
          <Link className="button button--ghost button--sm" href="/admin/projects">
            Back to list
          </Link>
        </div>
        <p className="u-text-muted u-text-sm">
          Fill in the details below to create a new project. The file will be saved as an MDX file in <code>content/projects</code>.
        </p>
      </div>

      <input type="hidden" name="slug" value={derivedSlug} />

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Front matter</h3>

        <div className="admin-essay-editor__primary-fields">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-title">
            <span className="admin-essay-editor__field-label">Title</span>
            <input
              id="project-title"
              type="text"
              name="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Threat Intel Workbench"
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-date">
            <span className="admin-essay-editor__field-label">Delivered</span>
            <input
              id="project-date"
              type="date"
              name="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="project-summary">
            <span className="admin-essay-editor__field-label">Summary</span>
            <textarea
              id="project-summary"
              name="summary"
              className="input admin-essay-editor__summary-input"
              rows={3}
              placeholder="Short blurb that describes the project impact."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-role">
            <span className="admin-essay-editor__field-label">Role</span>
            <input
              id="project-role"
              type="text"
              name="role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Technical Lead"
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-status">
            <span className="admin-essay-editor__field-label">Status</span>
            <input
              id="project-status"
              type="text"
              name="status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="In production"
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="project-stack">
            <span className="admin-essay-editor__field-label">Stack</span>
            <textarea
              id="project-stack"
              name="stack"
              className="input admin-essay-editor__summary-input"
              rows={3}
              placeholder="Next.js, FastAPI, PostgreSQL"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
            />
            <p className="admin-essay-editor__field-help u-text-muted u-text-xs">
              Comma or newline separated list of technologies.
            </p>
          </label>
        </div>

        <div className="admin-essay-editor__frontmatter-grid">
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
              Draft projects stay off the public projects page.
            </p>
          </label>
        </div>
      </section>

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Project body</h3>
        <textarea
          name="body"
          className="input admin-essay-editor__textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={28}
          spellCheck="false"
          placeholder="Write your project content here in Markdown..."
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
      {pending ? "Creating…" : "Create project"}
    </button>
  );
}
