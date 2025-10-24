import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { EssayEditor } from "../essay-editor";

const ESSAY_DIR = path.join(process.cwd(), "content", "writing");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface EditEssayPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: EditEssayPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Edit ${slug}`,
  };
}

export default async function EditEssayPage({ params }: EditEssayPageProps) {
  const slug = params.slug;

  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const actor = await requirePermission("audit:read");

  const filePath = path.join(ESSAY_DIR, `${slug}.mdx`);

  let rawContent: string;
  try {
    rawContent = await fs.readFile(filePath, "utf8");
  } catch (error) {
    notFound();
  }

  const parsed = matter(rawContent);
  const title = parsed.data?.title ? String(parsed.data.title) : slug;

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Edit essay">
        <EssayEditor slug={slug} initialContent={rawContent} title={title} />
      </AdminShell>
    </PageShell>
  );
}
