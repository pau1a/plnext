"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateEssayAction } from "./actions";

type FrontmatterValue = string | boolean;

interface EssayEditorProps {
  slug: string;
  title: string;
  initialBody: string;
  initialFrontmatter: Record<string, unknown>;
  frontmatterOrder: string[];
}

const initialEssayActionState = { status: "idle" as const };

const FIELD_CONFIG: Record<
  string,
  {
    label: string;
    type: "text" | "textarea" | "date" | "checkbox";
    placeholder?: string;
    helpText?: string;
    rows?: number;
  }
> = {
  title: {
    label: "Title",
    type: "text",
    placeholder: "Precision in the Loopery",
  },
  slug: {
    label: "Slug",
    type: "text",
    placeholder: "precision-in-the-loop",
    helpText: "Used in the URL. Changing this does not rename the file.",
  },
  date: {
    label: "Publish date",
    type: "date",
  },
  summary: {
    label: "Summary",
    type: "textarea",
    rows: 4,
    placeholder: "Single sentence used in listings and previews.",
  },
  featured: {
    label: "Featured",
    type: "checkbox",
    helpText: "Show this essay in featured slots around the site.",
  },
};

function normaliseFrontmatterValue(value: unknown): FrontmatterValue {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function formatFallbackLabel(key: string): string {
  return key
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function EssayEditor({
  slug,
  title,
  initialBody,
  initialFrontmatter,
  frontmatterOrder,
}: EssayEditorProps) {
  const orderedKeys = frontmatterOrder.length > 0 ? frontmatterOrder : Object.keys(initialFrontmatter);

  const [frontmatter, setFrontmatter] = useState<Record<string, FrontmatterValue>>(() => {
    return orderedKeys.reduce<Record<string, FrontmatterValue>>((accumulator, key) => {
      accumulator[key] = normaliseFrontmatterValue(initialFrontmatter[key]);
      return accumulator;
    }, {});
  });

  const [body, setBody] = useState(initialBody);
  const [actionState, formAction] = useActionState(updateEssayAction, initialEssayActionState);

  const displayTitle =
    typeof frontmatter.title === "string" && frontmatter.title.trim().length > 0
      ? frontmatter.title.trim()
      : title;

  const handleStringFieldChange = (key: string, value: string) => {
    setFrontmatter((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleBooleanFieldChange = (key: string, value: boolean) => {
    setFrontmatter((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <form className="u-stack u-gap-xl" action={formAction}>
      <div className="u-stack u-gap-sm">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap">
          <div>
            <h2 className="u-heading-md u-font-semibold">{displayTitle}</h2>
            <p className="u-text-muted u-text-sm">Editing `content/writing/{slug}.mdx`</p>
          </div>
          <div className="u-flex u-gap-sm">
            <Link className="button button--ghost button--sm" href="/admin/essays">
              Back to list
            </Link>
            <Link className="button button--ghost button--sm" href={`/essays/${slug}`}>
              View live
            </Link>
          </div>
        </div>
        <p className="u-text-muted u-text-sm">
          Update the front matter values below, then edit the Markdown body. The saved file will include the YAML
          metadata automatically.
        </p>
      </div>

      <input type="hidden" name="fileSlug" value={slug} />
      <input type="hidden" name="frontmatterKeys" value={JSON.stringify(orderedKeys)} />

      {orderedKeys.length > 0 ? (
        <section className="u-stack u-gap-sm">
          <h3 className="u-font-semibold u-text-sm u-letter-spaced">Front matter</h3>
          <div className="admin-essay-editor__frontmatter-grid">
            {orderedKeys.map((key) => {
              const config = FIELD_CONFIG[key] ?? {
                label: formatFallbackLabel(key),
                type: typeof frontmatter[key] === "boolean" ? "checkbox" : "text",
              };
              const label = config.label ?? formatFallbackLabel(key);
              const type = config.type;
              const fieldValue = frontmatter[key];
              const typeHintName = `__type__${key}`;

              if (type === "checkbox") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--checkbox">
                    <input type="hidden" name={typeHintName} value="boolean" />
                    <input type="hidden" name={key} value="false" />
                    <div className="admin-essay-editor__checkbox-row">
                      <input
                        type="checkbox"
                        name={key}
                        value="true"
                        checked={fieldValue === true}
                        onChange={(event) => handleBooleanFieldChange(key, event.target.checked)}
                      />
                      <span className="admin-essay-editor__field-label">{label}</span>
                    </div>
                    {config.helpText ? (
                      <p className="admin-essay-editor__field-help u-text-muted u-text-xs">{config.helpText}</p>
                    ) : null}
                  </label>
                );
              }

              if (type === "textarea") {
                return (
                  <label key={key} className="admin-essay-editor__field">
                    <input type="hidden" name={typeHintName} value="string" />
                    <span className="admin-essay-editor__field-label">{label}</span>
                    <textarea
                      name={key}
                      className="input"
                      rows={config.rows ?? 4}
                      placeholder={config.placeholder}
                      value={typeof fieldValue === "string" ? fieldValue : ""}
                      onChange={(event) => handleStringFieldChange(key, event.target.value)}
                    />
                    {config.helpText ? (
                      <p className="admin-essay-editor__field-help u-text-muted u-text-xs">{config.helpText}</p>
                    ) : null}
                  </label>
                );
              }

              const inputType = type === "date" ? "date" : "text";

              return (
                <label key={key} className="admin-essay-editor__field">
                  <input type="hidden" name={typeHintName} value="string" />
                  <span className="admin-essay-editor__field-label">{label}</span>
                  <input
                    type={inputType}
                    name={key}
                    className="input"
                    placeholder={config.placeholder}
                    value={typeof fieldValue === "string" ? fieldValue : ""}
                    onChange={(event) => handleStringFieldChange(key, event.target.value)}
                  />
                  {config.helpText ? (
                    <p className="admin-essay-editor__field-help u-text-muted u-text-xs">{config.helpText}</p>
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Essay body</h3>
        <textarea
          name="body"
          className="input admin-essay-editor__textarea"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={28}
          spellCheck="false"
        />
      </section>

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
