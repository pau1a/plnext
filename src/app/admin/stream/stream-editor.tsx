"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateStreamAction } from "./actions";

interface StreamEditorProps {
  entries: Array<{
    id: string;
    timestamp: string;
    body: string;
    visibility: "PUBLIC" | "LIMITED" | "PRIVATE";
    tags: string[];
    isNow?: boolean;
  }>;
}

const initialStreamState = { status: "idle" as const };

export function StreamEditor({ entries }: StreamEditorProps) {
  const [actionState, formAction] = useActionState(updateStreamAction, initialStreamState);

  return (
    <form className="u-stack u-gap-xl" action={formAction}>
      <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap">
        <div className="admin-essay-editor__lead">
          <div className="admin-essay-editor__statbar">
            <div className="admin-essay-editor__statrow">
              <span className="admin-essay-editor__stat">Editing <code>content/stream/stream.jsonl</code></span>
            </div>
          </div>
        </div>
        <Link className="button button--ghost button--sm" href="/stream">
          View live stream
        </Link>
      </div>

      <p className="u-text-muted u-text-sm">
        Update entries below. Tags accept known slugs from the shared tag registry and will merge with inline hashtags.
      </p>

      <div className="u-stack u-gap-lg">
        {entries.map((entry, index) => {
          const timestampLocal = formatLocalTimestamp(entry.timestamp);

          return (
            <div key={entry.id} className="u-stack u-gap-sm u-pad-md">
              <input type="hidden" name="entryId" value={entry.id} />
              <h3 className="u-text-sm u-text-muted u-letter-wide">Entry {entry.id}</h3>
              <div className="admin-essay-editor__primary-fields">
                <label className="admin-essay-editor__field admin-essay-editor__field--inline">
                  <span className="admin-essay-editor__field-label">Timestamp</span>
                  <input
                    className="input"
                    name={`timestamp-${index}`}
                    defaultValue={timestampLocal}
                    type="datetime-local"
                  />
                </label>
                <label className="admin-essay-editor__field admin-essay-editor__field--inline">
                  <span className="admin-essay-editor__field-label">Visibility</span>
                  <select className="input" name={`visibility-${index}`} defaultValue={entry.visibility}>
                    <option value="PUBLIC">Public</option>
                    <option value="LIMITED">Limited</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </label>
                <label className="admin-essay-editor__field admin-essay-editor__field--inline u-flex u-items-center u-gap-sm">
                  <input
                    type="checkbox"
                    name={`isNow-${index}`}
                    defaultChecked={entry.isNow}
                  />
                  <span className="admin-essay-editor__field-label">Set as Now</span>
                </label>
              </div>
              <label className="admin-essay-editor__field">
                <span className="admin-essay-editor__field-label">Body</span>
                <textarea
                  className="input"
                  name={`body-${index}`}
                  rows={6}
                  defaultValue={entry.body}
                  spellCheck="false"
                />
              </label>
              <label className="admin-essay-editor__field">
                <span className="admin-essay-editor__field-label">Tags</span>
                <textarea
                  className="input"
                  name={`tags-${index}`}
                  rows={2}
                  defaultValue={entry.tags.join(", ")}
                  placeholder="Comma or newline separated"
                />
              </label>
            </div>
          );
        })}
      </div>

      <div className="u-flex u-gap-sm u-items-center u-flex-wrap">
        <SubmitButton />
        {actionState.status === "success" ? (
          <span role="status" className="u-text-sm u-text-accent">
            {actionState.message}
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
      {pending ? "Saving…" : "Save changes"}
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
