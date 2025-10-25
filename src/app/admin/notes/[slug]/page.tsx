import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { NoteEditor } from "../note-editor";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface EditNotePageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: EditNotePageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Edit ${slug}`,
  };
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const slug = params.slug;

  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const actor = await requirePermission("audit:read");

  const filePath = path.join(NOTES_DIR, `${slug}.mdx`);

  let rawContent: string;
  try {
    rawContent = await fs.readFile(filePath, "utf8");
  } catch {
    notFound();
  }

  const parsed = matter(rawContent);
  const title = parsed.data?.title ? String(parsed.data.title) : slug;
  const frontmatter = parsed.data ?? {};
  let bodyContent = parsed.content;
  if (bodyContent.startsWith("\r\n")) {
    bodyContent = bodyContent.slice(2);
  } else if (bodyContent.startsWith("\n")) {
    bodyContent = bodyContent.slice(1);
  }
  const frontmatterOrder = Object.keys(frontmatter);

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Edit note" subtitle={title}>
        <NoteEditor
          slug={slug}
          title={title}
          initialBody={bodyContent}
          initialFrontmatter={frontmatter}
          frontmatterOrder={frontmatterOrder}
        />
      </AdminShell>
    </PageShell>
  );
}
