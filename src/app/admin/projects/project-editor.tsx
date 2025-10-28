"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { updateProjectAction } from "./actions";
import { ensureSlug } from "@/lib/slugify";

type FrontmatterValue = string | boolean;

interface ProjectEditorProps {
  slug: string;
  title: string;
  initialBody: string;
  initialFrontmatter: Record<string, unknown>;
  frontmatterOrder: string[];
}

const initialProjectActionState = { status: "idle" as const };

const FIELD_CONFIG: Record<
  string,
  {
    label: string;
    type: "text" | "textarea" | "date" | "checkbox" | "stack";
    placeholder?: string;
    helpText?: string;
    rows?: number;
  }
> = {
  title: {
    label: "Title",
    type: "text",
    placeholder: "Threat Intel Workbench",
  },
  date: {
    label: "Delivered",
    type: "date",
  },
  summary: {
    label: "Summary",
    type: "textarea",
    rows: 3,
    placeholder: "Short blurb that describes the project impact.",
  },
  role: {
    label: "Role",
    type: "text",
    placeholder: "Technical Lead",
  },
  status: {
    label: "Status",
    type: "text",
    placeholder: "In production",
  },
  stack: {
    label: "Stack",
    type: "stack",
    rows: 3,
    helpText: "Comma or newline separated list of technologies.",
  },
  draft: {
    label: "Draft",
    type: "checkbox",
    helpText: "Draft projects stay off the public projects page.",
  },
};

function normaliseFrontmatterValue(value: unknown): FrontmatterValue {
  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
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

export function ProjectEditor({ slug, title, initialBody, initialFrontmatter, frontmatterOrder }: ProjectEditorProps) {
  const orderedKeys = useMemo(() => {
    const base = (frontmatterOrder.length > 0 ? frontmatterOrder : Object.keys(initialFrontmatter)).slice();
    const required = ["title", "date", "summary", "role", "status", "stack", "draft"];
    for (const key of required) {
      if (!base.includes(key)) {
        base.push(key);
      }
    }
    return base.includes("slug") ? base : ["slug", ...base];
  }, [frontmatterOrder, initialFrontmatter]);

  const [frontmatter, setFrontmatter] = useState<Record<string, FrontmatterValue>>(() => {
    const initial = orderedKeys.reduce<Record<string, FrontmatterValue>>((accumulator, key) => {
      accumulator[key] = normaliseFrontmatterValue(initialFrontmatter[key]);
      return accumulator;
    }, {});

    const titleValue = typeof initial.title === "string" ? initial.title : title;
    initial.slug = ensureSlug(titleValue, slug);

    if (Array.isArray(initialFrontmatter.stack)) {
      initial.stack = initialFrontmatter.stack.join(", ");
    }

    return initial;
  });

  const [body, setBody] = useState(initialBody);
  const [closeAfterSave, setCloseAfterSave] = useState(false);
  const [actionState, formAction] = useActionState(updateProjectAction, initialProjectActionState);
  const router = useRouter();

  useEffect(() => {
    if (actionState.status === "success" && closeAfterSave) {
      const timer = setTimeout(() => {
        router.push("/admin/projects");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [actionState.status, closeAfterSave, router]);

  const derivedSlug = useMemo(() => {
    const titleValue = typeof frontmatter.title === "string" ? frontmatter.title : title;
    const existingSlug = typeof frontmatter.slug === "string" ? frontmatter.slug : slug;
    return ensureSlug(titleValue, existingSlug || slug);
  }, [frontmatter.title, frontmatter.slug, slug, title]);

  const editableKeys = useMemo(
    () => orderedKeys.filter((key) => key !== "slug"),
    [orderedKeys],
  );

  const primaryKeys = ["title", "date", "summary", "role", "status", "stack"];
  const remainingKeys = editableKeys.filter((key) => !primaryKeys.includes(key));

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
                  Editing <code>content/projects/{slug}.mdx</code>
                </span>
                <span className="admin-essay-editor__stat">
                  Permalink <code>/projects/{derivedSlug}</code>
                </span>
              </div>
            </div>
          </div>
          <div className="u-flex u-gap-sm">
            <Link className="button button--ghost button--sm" href="/admin/projects">
              Back to list
            </Link>
            <Link className="button button--ghost button--sm" href={`/projects/${derivedSlug}`} prefetch={false}>
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
            {primaryKeys.map((key) => {
              if (!editableKeys.includes(key)) {
                return null;
              }

              if (key === "summary") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="project-summary">
                    <span className="admin-essay-editor__field-label">Summary</span>
                    <textarea
                      id="project-summary"
                      name="summary"
                      className="input admin-essay-editor__summary-input"
                      rows={FIELD_CONFIG.summary.rows ?? 3}
                      placeholder={FIELD_CONFIG.summary.placeholder}
                      value={typeof frontmatter.summary === "string" ? frontmatter.summary : ""}
                      onChange={(event) => handleStringFieldChange("summary", event.target.value)}
                    />
                    <input type="hidden" name="__type__summary" value="string" />
                  </label>
                );
              }

              if (key === "stack") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="project-stack">
                    <span className="admin-essay-editor__field-label">Stack</span>
                    <textarea
                      id="project-stack"
                      name="stack"
                      className="input admin-essay-editor__summary-input"
                      rows={FIELD_CONFIG.stack.rows ?? 3}
                      placeholder="Comma or newline separated"
                      value={typeof frontmatter.stack === "string" ? frontmatter.stack : ""}
                      onChange={(event) => handleStringFieldChange("stack", event.target.value)}
                    />
                    <input type="hidden" name="__type__stack" value="array" />
                    <p className="admin-essay-editor__field-help u-text-muted u-text-xs">
                      Separate items with commas or new lines (optional).
                    </p>
                  </label>
                );
              }

              if (key === "title") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-title">
                    <span className="admin-essay-editor__field-label">Title</span>
                    <input
                      id="project-title"
                      type="text"
                      name="title"
                      className="input"
                      value={typeof frontmatter.title === "string" ? frontmatter.title : ""}
                      onChange={(event) => handleStringFieldChange("title", event.target.value)}
                      placeholder={FIELD_CONFIG.title.placeholder}
                    />
                    <input type="hidden" name="__type__title" value="string" />
                  </label>
                );
              }

              if (key === "date") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="project-date">
                    <span className="admin-essay-editor__field-label">Delivered</span>
                    <input
                      id="project-date"
                      type="date"
                      name="date"
                      className="input"
                      value={typeof frontmatter.date === "string" ? frontmatter.date : ""}
                      onChange={(event) => handleStringFieldChange("date", event.target.value)}
                    />
                    <input type="hidden" name="__type__date" value="string" />
                  </label>
                );
              }

              if (key === "role" || key === "status") {
                return (
                  <label key={key} className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor={`project-${key}`}>
                    <span className="admin-essay-editor__field-label">{FIELD_CONFIG[key].label}</span>
                    <input
                      id={`project-${key}`}
                      type="text"
                      name={key}
                      className="input"
                      value={typeof frontmatter[key] === "string" ? (frontmatter[key] as string) : ""}
                      onChange={(event) => handleStringFieldChange(key, event.target.value)}
                      placeholder={FIELD_CONFIG[key].placeholder}
                    />
                    <input type="hidden" name={`__type__${key}`} value="string" />
                  </label>
                );
              }

              return null;
            })}
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
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Project body</h3>
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
        <SaveButton onSaveAndClose={() => setCloseAfterSave(true)} />
        {actionState.status === "success" ? (
          <span role="status" className="u-text-sm u-text-accent">
            {actionState.message}
            {closeAfterSave ? " Redirecting..." : ""}
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

interface SaveButtonProps {
  onSaveAndClose: () => void;
}

function SaveButton({ onSaveAndClose }: SaveButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
      <button
        className="button button--ghost"
        type="submit"
        disabled={pending}
        onClick={onSaveAndClose}
      >
        Save and close
      </button>
    </>
  );
}
