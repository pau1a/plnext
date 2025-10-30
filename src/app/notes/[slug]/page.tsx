import { Suspense } from "react";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { NoteLayout } from "@/components/notes/NoteLayout";
import {
  getNoteBySlug,
  getNoteSlugs,
  getNotes,
  stripMarkdown,
  type NoteSummary,
} from "@/lib/notes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface NotePageParams {
  slug: string;
}

type NotePageParamsInput = NotePageParams | Promise<NotePageParams>;

interface NotePageProps {
  params: NotePageParamsInput;
}

async function resolveParams(params: NotePageParamsInput): Promise<NotePageParams> {
  if (typeof (params as Promise<NotePageParams>)?.then === "function") {
    return params as Promise<NotePageParams>;
  }

  return params as NotePageParams;
}

export async function generateStaticParams() {
  return getNoteSlugs();
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  const note = await getNoteBySlug(slug);

  if (!note) {
    return {
      title: "Note not found",
    };
  }

  const canonicalPath = `/notes/${note.slug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";
  const descriptionSource = note.summary || stripMarkdown(note.body);
  const description = descriptionSource
    ? descriptionSource.slice(0, 156).replace(/\s+\S*$/, "")
    : "A short note from Paula Livingstone.";

  return {
    title: note.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title: note.title,
      description,
      url: canonicalPath,
      publishedTime: new Date(note.date).toISOString(),
      tags: note.tags,
      images: [
        {
          url: `${siteUrl}/window.svg`,
          width: 1200,
          height: 630,
          alt: "Paula Livingstone window mark",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description,
      images: [`${siteUrl}/window.svg`],
    },
  };
}

function selectRelatedNotes(note: NoteSummary, notes: NoteSummary[]) {
  if (!note.tags?.length) {
    return [];
  }

  const tagSet = new Set(note.tags);
  return notes
    .filter((candidate) => candidate.slug !== note.slug)
    .filter((candidate) => candidate.tags?.some((tag) => tagSet.has(tag)))
    .slice(0, 3);
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { slug } = await resolveParams(params);
  const note = await getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const resolvedNote = note;
  const allNotes = await getNotes({ includeDrafts: false });
  const relatedNotes = selectRelatedNotes(resolvedNote, allNotes);

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <NoteLayout
          title={resolvedNote.title}
          date={resolvedNote.date}
          tags={resolvedNote.tags}
          relatedNotes={relatedNotes}
        >
          {resolvedNote.content}
        </NoteLayout>

        <section
          aria-labelledby="comments-heading"
          className="u-stack u-gap-md u-margin-block-start-2xl"
        >
          <h2 id="comments-heading" className="heading-subtitle">
            Join the discussion
          </h2>
          <CommentProvider slug={resolvedNote.slug}>
            <CommentForm slug={resolvedNote.slug} />
            <Suspense fallback={null}>
              <CommentList slug={resolvedNote.slug} />
            </Suspense>
          </CommentProvider>
        </section>
      </MotionFade>
    </PageShell>
  );
}
