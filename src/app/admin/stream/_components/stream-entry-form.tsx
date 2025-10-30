"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { StreamSourceRecord } from "@/lib/stream";
import { saveStreamEntryAction, deleteStreamEntryAction } from "../actions";

const AVAILABLE_TAGS = [
  { slug: "application-security", name: "Application Security" },
  { slug: "devsecops", name: "DevSecOps" },
  { slug: "operations", name: "Operations" },
  { slug: "security-operations", name: "Security Operations" },
  { slug: "ai", name: "AI" },
  { slug: "writing", name: "Writing" },
  { slug: "stream", name: "Stream" },
  { slug: "process", name: "Process" },
  { slug: "experiments", name: "Experiments" },
];

interface StreamEntryFormProps {
  entry?: StreamSourceRecord;
}

const initialState = { status: "idle" as const };

export function StreamEntryForm({ entry }: StreamEntryFormProps) {
  const router = useRouter();
  const [saveState, saveAction] = useActionState(saveStreamEntryAction, initialState);
  const [deleteState, deleteAction] = useActionState(deleteStreamEntryAction, initialState);
  const [tagsValue, setTagsValue] = useState(entry?.tags?.join(", ") ?? "");

  const isNew = !entry;
  const timestampLocal = entry ? formatLocalTimestamp(entry.timestamp) : formatLocalTimestamp(new Date().toISOString());

  const addTag = (slug: string) => {
    const currentTags = tagsValue
      .split(/[,\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(slug)) {
      setTagsValue([...currentTags, slug].join(", "));
    }
  };

  // Navigate back to list after successful save
  useEffect(() => {
    if (saveState.status === "success") {
      const timer = setTimeout(() => {
        router.push("/admin/stream");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [saveState.status, router]);

  // Navigate back to list after successful delete
  useEffect(() => {
    if (deleteState.status === "success") {
      const timer = setTimeout(() => {
        router.push("/admin/stream");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [deleteState.status, router]);

  return (
    <div className="u-stack u-gap-lg">
      <form className="u-stack u-gap-lg" action={saveAction}>
        <input type="hidden" name="originalId" value={entry?.id ?? ""} />

        <label className="admin-essay-editor__field">
          <span className="admin-essay-editor__field-label">Entry ID</span>
          <input
            className="input"
            name="id"
            defaultValue={entry?.id ?? generateId()}
            required
            placeholder="2025-01-15T08:30:12Z-01"
          />
          <span className="u-text-xs u-text-muted">Format: YYYY-MM-DDTHH:MM:SSZ-NN</span>
        </label>

        <label className="admin-essay-editor__field">
          <span className="admin-essay-editor__field-label">Timestamp</span>
          <input
            className="input"
            name="timestamp"
            defaultValue={timestampLocal}
            type="datetime-local"
            required
          />
        </label>

        <label className="admin-essay-editor__field">
          <span className="admin-essay-editor__field-label">Visibility</span>
          <select className="input" name="visibility" defaultValue={entry?.visibility ?? "PRIVATE"}>
            <option value="PUBLIC">🌐 Public</option>
            <option value="LIMITED">🔒 Limited</option>
            <option value="PRIVATE">🚫 Private</option>
          </select>
        </label>

        <label className="admin-essay-editor__field">
          <input
            type="checkbox"
            name="isNow"
            defaultChecked={entry?.isNow ?? false}
          />
          <span className="admin-essay-editor__field-label" style={{ marginLeft: "0.5rem" }}>
            Set as Now
          </span>
        </label>

        <label className="admin-essay-editor__field">
          <span className="admin-essay-editor__field-label">Body</span>
          <textarea
            className="input"
            name="body"
            rows={12}
            defaultValue={entry?.body ?? ""}
            spellCheck="false"
            required
            placeholder="Write your stream entry content here..."
          />
          <span className="u-text-xs u-text-muted">Supports markdown, wiki links [[like-this]], and hashtags #like-this</span>
        </label>

        <div className="admin-essay-editor__field">
          <span className="admin-essay-editor__field-label">Tags</span>
          <input
            className="input"
            name="tags"
            value={tagsValue}
            onChange={(e) => setTagsValue(e.target.value)}
            placeholder="operations, writing, projects"
          />
          <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <span className="u-text-xs u-text-muted">Available tags:</span>
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = tagsValue.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  type="button"
                  className={`u-text-xs stream-entry-form__tag${isSelected ? " stream-entry-form__tag--selected" : ""}`}
                  onClick={() => addTag(tag.slug)}
                >
                  + {tag.name}
                </button>
              );
            })}
          </div>
          <span className="u-text-xs u-text-muted" style={{ display: "block", marginTop: "0.5rem" }}>
            To add a new tag, edit <code>src/lib/tags.ts</code> and add it to TAG_DEFINITIONS
          </span>
        </div>

        <div className="u-flex u-gap-sm u-items-center u-flex-wrap">
          <SaveButton isNew={isNew} />
          <button
            type="button"
            className="button button--ghost"
            onClick={() => router.push("/admin/stream")}
          >
            Cancel
          </button>

          {saveState.status === "success" ? (
            <span role="status" className="u-text-sm u-text-accent">
              {saveState.message}
            </span>
          ) : null}
          {saveState.status === "error" ? (
            <span role="alert" className="u-text-sm u-text-error">
              {saveState.message}
            </span>
          ) : null}
        </div>
      </form>

      {!isNew && (
        <form action={deleteAction} className="u-pad-md" style={{ borderTop: "1px solid var(--admin-border-subtle)" }}>
          <input type="hidden" name="id" value={entry.id} />
          <div className="u-stack u-gap-sm">
            <h3 className="u-text-lg u-font-semibold u-text-error">Danger Zone</h3>
            <p className="u-text-sm u-text-muted">Delete this stream entry permanently. This action cannot be undone.</p>
            <div className="u-flex u-gap-sm u-items-center">
              <DeleteButton />
              {deleteState.status === "error" ? (
                <span role="alert" className="u-text-sm u-text-error">
                  {deleteState.message}
                </span>
              ) : null}
            </div>
          </div>
        </form>
      )}

      <style jsx>{`
        .stream-entry-form__tag {
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--surface-border);
          border-radius: 3px;
          background-color: var(--surface-base);
          color: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .stream-entry-form__tag:hover {
          background-color: var(--surface-elevated);
        }

        .stream-entry-form__tag--selected {
          background-color: var(--admin-accent);
          border-color: var(--admin-border-strong);
          color: var(--admin-status-contrast);
        }

        .stream-entry-form__tag--selected:hover {
          background-color: var(--admin-accent-strong);
          border-color: var(--admin-border-strong-hover);
        }
      `}</style>
    </div>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create Entry" : "Save Changes"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button button--danger" type="submit" disabled={pending}>
      {pending ? "Deleting…" : "Delete Entry"}
    </button>
  );
}

function formatLocalTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

function generateId(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  return `${timestamp}-01`;
}
