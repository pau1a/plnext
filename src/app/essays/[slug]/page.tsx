import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { formatDate } from "@/lib/date";
import { getEssay, getEssaySlugs, renderEssayBody } from "@/lib/writing";

interface EssayPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getEssaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) {
    return { title: "Essay not found" };
  }

  return {
    title: essay.title,
    description: essay.summary,
  } satisfies Metadata;
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const essay = await getEssay(slug);

  if (!essay) {
    notFound();
  }

  if (essay.slug !== slug) {
    redirect(`/essays/${essay.slug}`);
  }

  const bodyContent = essay.content ?? (await renderEssayBody(essay.body));

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <article className="essay-article u-stack u-gap-2xl">
        <MotionFade>
          <header className="u-stack u-gap-sm">
            <p className="essay-article__meta">
              <span>{formatDate(essay.date)}</span>
              <span aria-hidden="true">•</span>
              <span>/{essay.slug}</span>
            </p>
            <h1 className="u-heading-xl u-font-semibold">{essay.title}</h1>
            {essay.summary ? <p className="u-text-muted u-text-lg u-max-w-prose">{essay.summary}</p> : null}
          </header>
        </MotionFade>

        <div className="prose prose-invert essay-article__content">{bodyContent}</div>

        <MotionFade delay={0.05}>
          <section
            className="u-stack u-gap-md"
            aria-labelledby="comments-heading"
          >
            <h2 id="comments-heading" className="heading-subtitle">
              Join the discussion
            </h2>
            <CommentProvider slug={essay.slug}>
              <CommentForm slug={essay.slug} />
              <Suspense fallback={null}>
                <CommentList slug={essay.slug} />
              </Suspense>
            </CommentProvider>
          </section>
        </MotionFade>
      </article>
    </PageShell>
  );
}
