import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

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

async function EssayBody({
  content,
  source,
}: {
  content: ReactNode | null | undefined;
  source: string;
}) {
  if (content) {
    return <>{content}</>;
  }

  const fallback = await renderEssayBody(source);

  return <>{fallback}</>;
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

  return (
    <PageShell as="main" className="essay-page u-pad-block-4xl">
      <article className="essay-article u-stack u-gap-3xl">
        <MotionFade>
          <header className="essay-hero">
            <div className="essay-hero__background" aria-hidden="true" />
            <div className="essay-hero__content">
              <p className="essay-hero__meta">
                <span className="essay-hero__pill">Essay</span>
                <span>{formatDate(essay.date)}</span>
                <span aria-hidden="true">•</span>
                <span>/{essay.slug}</span>
              </p>
              <h1 className="essay-hero__title">{essay.title}</h1>
              {essay.summary ? <p className="essay-hero__summary">{essay.summary}</p> : null}
            </div>
          </header>
        </MotionFade>

        <MotionFade delay={0.03}>
          <div className="essay-layout">
            <div className="essay-layout__accent" aria-hidden="true" />
            <div className="essay-layout__content prose essay-article__content">
              <EssayBody content={essay.content} source={essay.body} />
            </div>
          </div>
        </MotionFade>

        <MotionFade delay={0.08}>
          <section
            className="essay-discussion u-stack u-gap-lg"
            aria-labelledby="comments-heading"
          >
            <div className="essay-discussion__header">
              <h2 id="comments-heading" className="heading-subtitle">
                Join the discussion
              </h2>
              <p className="essay-discussion__summary">
                Share reflections, questions, or favourite lines. Thoughtful conversation keeps these ideas alive.
              </p>
            </div>
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
