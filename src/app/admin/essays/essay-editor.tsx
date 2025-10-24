"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateEssayAction } from "./actions";

interface EssayEditorProps {
  slug: string;
  initialContent: string;
  title: string;
}

const initialEssayActionState = { status: "idle" as const };

export function EssayEditor({ slug, initialContent, title }: EssayEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [state, formAction] = useActionState(updateEssayAction, initialEssayActionState);

  return (
    <form className="u-stack u-gap-xl" action={formAction}>
      <div className="u-stack u-gap-sm">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap">
          <div>
            <h2 className="u-heading-md u-font-semibold">{title}</h2>
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
          Update the Markdown content below. Front matter is included—keep the leading and trailing `---` lines intact.
        </p>
      </div>

      <input type="hidden" name="slug" value={slug} />

      <label className="u-stack u-gap-sm">
        <span className="u-font-semibold">Essay content</span>
        <textarea
          name="content"
          className="input admin-essay-editor__textarea"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={28}
          spellCheck="false"
        />
      </label>

      <div className="u-flex u-gap-sm u-items-center u-flex-wrap">
        <SubmitButton />
        {state.status === "success" ? (
          <span role="status" className="u-text-sm u-text-accent">
            {state.message}
          </span>
        ) : null}
        {state.status === "error" ? (
          <span role="alert" className="u-text-sm u-text-error">
            {state.message}
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
