"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateEssayAction } from "./actions";
import { ensureSlug } from "@/lib/slugify";

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
  const orderedKeys = useMemo(() => {
    const base = (frontmatterOrder.length > 0 ? frontmatterOrder : Object.keys(initialFrontmatter)).slice();
    return base.includes("slug") ? base : ["slug", ...base];
  }, [frontmatterOrder, initialFrontmatter]);

  const editableKeys = useMemo(
    () => orderedKeys.filter((key) => key !== "slug" && key !== "featured"),
    [orderedKeys],
  );

  const remainingKeys = useMemo(
    () => editableKeys.filter((key) => !["title", "date", "summary"].includes(key)),
    [editableKeys],
  );

  const hasTitleField = editableKeys.includes("title");
  const hasDateField = editableKeys.includes("date");
  const hasSummaryField = editableKeys.includes("summary");

  const [frontmatter, setFrontmatter] = useState<Record<string, FrontmatterValue>>(() => {
    const initial = orderedKeys.reduce<Record<string, FrontmatterValue>>((accumulator, key) => {
      accumulator[key] = normaliseFrontmatterValue(initialFrontmatter[key]);
      return accumulator;
    }, {});

    const titleValue = typeof initial.title === "string" ? initial.title : title;
    initial.slug = ensureSlug(titleValue, slug);

    return initial;
  });

  const [body, setBody] = useState(initialBody);
  const [actionState, formAction] = useActionState(updateEssayAction, initialEssayActionState);

  const derivedSlug = useMemo(() => {
    const titleValue = typeof frontmatter.title === "string" ? frontmatter.title : title;
    const existingSlug = typeof frontmatter.slug === "string" ? frontmatter.slug : slug;
    return ensureSlug(titleValue, existingSlug || slug);
  }, [frontmatter.title, frontmatter.slug, slug, title]);

  const isFeatured = frontmatter.featured === true;

  const handleStringFieldChange = (key: string, value: string) => {
    setFrontmatter((previous) => {
      const next = {
        ...previous,
        [key]: value,
      };

      if (key === "title") {
        next.slug = ensureSlug(value, slug);
      }

      return next;
    });
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
          <div className="admin-essay-editor__lead">
            <div className="admin-essay-editor__statbar">
              <div className="admin-essay-editor__statrow">
                <span className="admin-essay-editor__stat">
                  Editing <code>content/writing/{slug}.mdx</code>
                </span>
                <span className="admin-essay-editor__stat">
                  Permalink <code>/essays/{derivedSlug}</code>
                </span>
              </div>
              <div className="admin-essay-editor__statrow">
                <label className="admin-essay-editor__featured-toggle">
                  <input type="hidden" name="__type__featured" value="boolean" />
                  <input type="hidden" name="featured" value="false" />
                  <input
                    type="checkbox"
                    name="featured"
                    value="true"
                    checked={isFeatured}
                    onChange={(event) => handleBooleanFieldChange("featured", event.target.checked)}
                  />
                  <span className="admin-essay-editor__featured-label">Featured</span>
                </label>
                <span className="admin-essay-editor__featured-note u-text-muted u-text-xs">
                  Show in featured slots across the site.
                </span>
              </div>
            </div>
          </div>
          <div className="u-flex u-gap-sm">
            <Link className="button button--ghost button--sm" href="/admin/essays">
              Back to list
            </Link>
            <Link className="button button--ghost button--sm" href={`/essays/${derivedSlug}`} prefetch={false}>
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
      <input type="hidden" name="__type__slug" value="string" />
      <input type="hidden" name="slug" value={derivedSlug} />

      {editableKeys.length > 0 ? (
        <section className="u-stack u-gap-sm">
          <h3 className="u-font-semibold u-text-sm u-letter-spaced">Front matter</h3>

          <div className="admin-essay-editor__primary-fields">
            {hasTitleField ? (
              <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="essay-title">
                <span className="admin-essay-editor__field-label">Title</span>
                <input
                  id="essay-title"
                  type="text"
                  name="title"
                  className="input"
                  value={typeof frontmatter.title === "string" ? frontmatter.title : ""}
                  onChange={(event) => handleStringFieldChange("title", event.target.value)}
                  placeholder={FIELD_CONFIG.title.placeholder}
                />
                <input type="hidden" name="__type__title" value="string" />
              </label>
            ) : null}

            {hasDateField ? (
              <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="essay-date">
                <span className="admin-essay-editor__field-label">Publish date</span>
                <input
                  id="essay-date"
                  type="date"
                  name="date"
                  className="input"
                  value={typeof frontmatter.date === "string" ? frontmatter.date : ""}
                  onChange={(event) => handleStringFieldChange("date", event.target.value)}
                />
                <input type="hidden" name="__type__date" value="string" />
              </label>
            ) : null}

            {hasSummaryField ? (
              <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="essay-summary">
                <span className="admin-essay-editor__field-label">Summary</span>
                <textarea
                  id="essay-summary"
                  name="summary"
                  className="input admin-essay-editor__summary-input"
                  rows={3}
                  placeholder={FIELD_CONFIG.summary.placeholder}
                  value={typeof frontmatter.summary === "string" ? frontmatter.summary : ""}
                  onChange={(event) => handleStringFieldChange("summary", event.target.value)}
                />
                <input type="hidden" name="__type__summary" value="string" />
              </label>
            ) : null}
          </div>

          {remainingKeys.length > 0 ? (
            <div className="admin-essay-editor__frontmatter-grid">
              {remainingKeys.map((key) => {
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
          ) : null}
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
