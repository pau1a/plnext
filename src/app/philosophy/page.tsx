import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

import LocalToc from "@/components/LocalToc";
import { MDXComponents } from "@/components/mdx/MDXComponents";
import { getPhilosophy } from "@/lib/philosophy";

export const metadata = {
  title: "Philosophy | Paula Livingstone",
  description: "Guiding principles for engineering and design.",
  alternates: { canonical: "/philosophy" },
};

export default async function PhilosophyPage() {
  const { meta, content } = await getPhilosophy();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Philosophy</h1>
        {meta?.updated ? (
          <time className="mt-1 block text-sm text-muted">
            Updated{" "}
            {new Date(meta.updated as string).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </time>
        ) : null}
        {meta?.summary ? <p className="mt-2 text-muted">{meta.summary}</p> : null}
      </header>

      {meta?.toc ? <LocalToc content={content} /> : null}

      <div className="prose">
        <MDXRemote source={content} components={MDXComponents} />
      </div>

      <footer className="mt-12 text-sm text-muted">
        <p>
          Related: <Link className="text-teal hover:underline" href="/writing">Writing</Link> ·{" "}
          <Link className="text-teal hover:underline" href="/notes">Notes</Link>
        </p>
      </footer>
    </article>
  );
}
