import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { formatDate } from "@/lib/date";
import { getEssays } from "@/lib/writing";

export const metadata = {
  title: "Essays",
  description: "Long-form essays on cybersecurity, resilience, and practical engineering.",
};

export default async function EssaysIndexPage() {
  const essays = await getEssays({ includeDrafts: false });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <div className="u-stack u-gap-2xl">
          <header className="u-stack u-gap-sm">
            <h1 className="u-heading-lg u-font-semibold">Essays</h1>
            <p className="u-text-muted u-text-lg u-max-w-prose">
              Deep dives into the systems, teams, and guardrails that keep complex platforms trustworthy.
            </p>
          </header>

          <section className="u-stack u-gap-xl" aria-label="Essay list">
            {essays.map((essay) => (
              <article key={essay.slug} className="essay-card">
                <header className="essay-card__header">
                  <p className="essay-card__meta">
                    <span>{formatDate(essay.date)}</span>
                    <span aria-hidden="true">•</span>
                    <span>/{essay.slug}</span>
                    {essay.draft ? <span className="essay-card__badge">Draft</span> : null}
                    {essay.featured ? <span className="essay-card__badge essay-card__badge--accent">Featured</span> : null}
                  </p>
                  <h2 className="essay-card__title">
                    <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
                  </h2>
                </header>
                <p className="essay-card__summary">
                  {essay.summary ?? "Add a summary in the front matter to give readers a preview."}
                </p>
                <div>
                  <Link className="essay-card__cta" href={`/essays/${essay.slug}`}>
                    Read essay
                  </Link>
                </div>
              </article>
            ))}
            {essays.length === 0 ? (
              <p className="u-text-muted">No essays published yet. Add `.mdx` files under `content/writing`.</p>
            ) : null}
          </section>
        </div>
      </MotionFade>
    </PageShell>
  );
}
