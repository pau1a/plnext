import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { formatDate } from "@/lib/date";
import { getEssay, getEssaySlugs } from "@/lib/writing";

interface EssayPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getEssaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const essay = await getEssay(params.slug);
  if (!essay) {
    return { title: "Essay not found" };
  }

  return {
    title: essay.title,
    description: essay.summary,
  } satisfies Metadata;
}

export default async function EssayPage({ params }: EssayPageProps) {
  const essay = await getEssay(params.slug);

  if (!essay) {
    notFound();
  }

  if (essay.slug !== params.slug) {
    redirect(`/essays/${essay.slug}`);
  }

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <article className="essay-article u-stack u-gap-2xl">
          <header className="u-stack u-gap-sm">
            <p className="essay-article__meta">
              <span>{formatDate(essay.date)}</span>
              <span aria-hidden="true">•</span>
              <span>/{essay.slug}</span>
            </p>
            <h1 className="u-heading-xl u-font-semibold">{essay.title}</h1>
            {essay.summary ? <p className="u-text-muted u-text-lg u-max-w-prose">{essay.summary}</p> : null}
          </header>

          <div className="prose prose-invert essay-article__content">{essay.content}</div>
        </article>
      </MotionFade>
    </PageShell>
  );
}
