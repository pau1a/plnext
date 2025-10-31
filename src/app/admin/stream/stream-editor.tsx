"use client";

import Link from "next/link";
import { useActionState, type CSSProperties } from "react";
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
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link className="button button--sm" href="/admin/stream/new">
            + New Entry
          </Link>
          <Link className="button button--ghost button--sm" href="/stream">
            View live stream
          </Link>
        </div>
      </div>

      <p className="u-text-muted u-text-sm">
        Update entries below. Tags accept known slugs from the shared tag registry and will merge with inline hashtags.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {entries.map((entry, index) => {
          const timestampLocal = formatLocalTimestamp(entry.timestamp);
          const visibilityColor =
            {
              PUBLIC: "var(--color-teal-500)",
              LIMITED: "var(--color-amber-500)",
              PRIVATE: "var(--color-crimson-500)",
            }[entry.visibility] ?? "var(--color-graphite-400)";

          const accentStyle: CSSProperties = {
            "--stream-entry-accent": visibilityColor,
          };

          return (
            <div
              key={entry.id}
              className="stream-editor__entry"
              style={accentStyle}
            >
              <input type="hidden" name="entryId" value={entry.id} />

              {/* Compact header row with all metadata */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                <Link
                  href={`/admin/stream/edit/${entry.id}`}
                  className="button button--ghost button--sm"
                  style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}
                >
                  Edit
                </Link>
                <input
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.4rem",
                    border: "1px solid var(--surface-border)",
                    backgroundColor: "var(--surface-base)",
                    borderRadius: "3px",
                    flex: "0 0 auto"
                  }}
                  name={`timestamp-${index}`}
                  defaultValue={timestampLocal}
                  type="datetime-local"
                />

                <select
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.4rem",
                    border: "1px solid var(--surface-border)",
                    backgroundColor: "var(--surface-base)",
                    borderRadius: "3px",
                    flex: "0 0 auto"
                  }}
                  name={`visibility-${index}`}
                  defaultValue={entry.visibility}
                >
                  <option value="PUBLIC">🌐 Pub</option>
                  <option value="LIMITED">🔒 Ltd</option>
                  <option value="PRIVATE">🚫 Prv</option>
                </select>

                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name={`isNow-${index}`}
                    defaultChecked={entry.isNow}
                    style={{ margin: 0 }}
                  />
                  <span>Now</span>
                </label>

                <input
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.4rem",
                    border: "1px solid var(--surface-border)",
                    backgroundColor: "var(--surface-base)",
                    borderRadius: "3px",
                    flex: "1 1 150px",
                    minWidth: "120px"
                  }}
                  name={`tags-${index}`}
                  defaultValue={entry.tags.join(", ")}
                  placeholder="tags..."
                />
              </div>

              {/* Body textarea - super compact */}
              <textarea
                style={{
                  width: "100%",
                  fontSize: "0.85rem",
                  padding: "0.4rem",
                  border: "1px solid var(--surface-border)",
                  backgroundColor: "var(--surface-base)",
                  borderRadius: "3px",
                  fontFamily: "inherit",
                  lineHeight: "1.3",
                  resize: "vertical"
                }}
                name={`body-${index}`}
                rows={2}
                defaultValue={entry.body}
                spellCheck="false"
              />
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
      <style jsx>{`
        .stream-editor__entry {
          --stream-entry-accent: var(--surface-border);
          border-radius: var(--radius-md);
          padding: 0.5rem;
          background-color: var(--surface-elevated);
          border: 1px solid color-mix(in srgb, var(--surface-border) 65%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--surface-border) 35%, transparent),
            inset 4px 0 0 color-mix(
              in srgb,
              var(--stream-entry-accent) 85%,
              var(--surface-elevated) 15%
            );
          transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .stream-editor__entry:hover {
          background-color: var(--surface-base);
          border-color: color-mix(in srgb, var(--surface-border) 80%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--surface-border) 50%, transparent),
            inset 4px 0 0 color-mix(
              in srgb,
              var(--stream-entry-accent) 92%,
              var(--surface-base) 8%
            );
        }
      `}</style>
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
