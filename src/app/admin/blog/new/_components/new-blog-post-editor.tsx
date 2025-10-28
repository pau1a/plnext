"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createBlogPostAction } from "../../actions";
import { ensureSlug } from "@/lib/slugify";

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

const initialBlogActionState = { status: "idle" as const };

export function NewBlogPostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [draft, setDraft] = useState(true);
  const [body, setBody] = useState("");

  const [actionState, formAction] = useActionState(createBlogPostAction, initialBlogActionState);

  const derivedSlug = useMemo(() => {
    return ensureSlug(title, "");
  }, [title]);

  useEffect(() => {
    if (actionState.status === "success") {
      const timer = setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [actionState.status, router]);

  const addTag = (tagSlug: string) => {
    const currentTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tagSlug)) {
      setTags(currentTags.length > 0 ? `${tags}, ${tagSlug}` : tagSlug);
    }
  };

  return (
    <form className="u-stack u-gap-xl" action={formAction}>
      <div className="u-stack u-gap-sm">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap">
          <div className="admin-essay-editor__lead">
            <div className="admin-essay-editor__statbar">
              <div className="admin-essay-editor__statrow">
                <span className="admin-essay-editor__stat">
                  Creating new blog post
                </span>
                <span className="admin-essay-editor__stat">
                  Permalink <code>/writing/{derivedSlug || "(auto-generated)"}</code>
                </span>
              </div>
            </div>
          </div>
          <Link className="button button--ghost button--sm" href="/admin/blog">
            Back to list
          </Link>
        </div>
        <p className="u-text-muted u-text-sm">
          Fill in the details below to create a new blog post. The file will be saved as an MDX file in <code>content/blog</code>.
        </p>
      </div>

      <input type="hidden" name="slug" value={derivedSlug} />

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Front matter</h3>

        <div className="admin-essay-editor__primary-fields">
          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="blog-title">
            <span className="admin-essay-editor__field-label">Title</span>
            <input
              id="blog-title"
              type="text"
              name="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Securing the Modern Web"
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--inline" htmlFor="blog-date">
            <span className="admin-essay-editor__field-label">Publish date</span>
            <input
              id="blog-date"
              type="date"
              name="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="blog-description">
            <span className="admin-essay-editor__field-label">Description</span>
            <textarea
              id="blog-description"
              name="description"
              className="input admin-essay-editor__summary-input"
              rows={3}
              placeholder="Practical steps to harden your full-stack applications without slowing down delivery."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label className="admin-essay-editor__field admin-essay-editor__field--summary" htmlFor="blog-tags">
            <span className="admin-essay-editor__field-label">Tags</span>
            <textarea
              id="blog-tags"
              name="tags"
              className="input admin-essay-editor__summary-input"
              rows={3}
              placeholder="comma or newline separated"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {AVAILABLE_TAGS.map((tag) => {
                const currentTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
                const isSelected = currentTags.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => addTag(tag.slug)}
                    className="button button--xs"
                    style={{
                      backgroundColor: isSelected ? "var(--color-teal-400)" : "var(--surface-secondary)",
                      color: isSelected ? "white" : "inherit",
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            <p className="admin-essay-editor__field-help u-text-muted u-text-xs">
              Click tags above to add them, or type custom tags separated by commas.
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
              Draft posts stay off the public writing feed.
            </p>
          </label>
        </div>
      </section>

      <section className="u-stack u-gap-sm">
        <h3 className="u-font-semibold u-text-sm u-letter-spaced">Article body</h3>
        <textarea
          name="body"
          className="input admin-essay-editor__textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={28}
          spellCheck="false"
          placeholder="Write your blog post content here in Markdown..."
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
      {pending ? "Creating…" : "Create blog post"}
    </button>
  );
}
