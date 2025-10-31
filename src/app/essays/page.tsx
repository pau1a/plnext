import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { formatDate } from "@/lib/date";
import { getEssays } from "@/lib/writing";

import styles from "./essays.module.scss";

export const metadata = {
  title: "Essays",
  description: "Long-form essays on cybersecurity, resilience, and practical engineering.",
};

export default async function EssaysIndexPage() {
  const essays = await getEssays({ includeDrafts: false });

  return (
    <PageShell as="main" outerClassName={styles.page} fullWidth>
      <div className={styles.hero} aria-hidden="true">
        <div className={styles.heroVeil} />
        <div className={`${styles.heroParticle} ${styles.heroParticleOne}`} />
        <div className={`${styles.heroParticle} ${styles.heroParticleTwo}`} />
        <div className={`${styles.heroParticle} ${styles.heroParticleThree}`} />
      </div>

      <div className={styles.inner}>
        <MotionFade>
          <header className={styles.header}>
            <div className={styles.headerMeta}>
              <span className={styles.headerEyebrow}>Knowledge stream</span>
              <span className={styles.headerCount}>{essays.length} essays</span>
            </div>
            <h1 className={`u-heading-xl ${styles.headerTitle}`}>
              Field notes from engineered calm
            </h1>
            <p className={`${styles.headerSummary} u-max-w-prose`}>
              Dispatches on resilience, safety, and the guardrails that keep ambitious systems from flying apart.
            </p>
            <div className={styles.headerDivider} aria-hidden="true" />
          </header>
        </MotionFade>

        <section className={styles.grid} aria-label="Latest essays">
          {essays.map((essay, index) => (
            <MotionFade key={essay.slug} delay={index * 0.05}>
              <article className={styles.card} data-featured={essay.featured ? "true" : undefined}>
                <header className={styles.cardHeader}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>{formatDate(essay.date)}</span>
                    <span className={styles.cardSlug}>/{essay.slug}</span>
                    {essay.featured ? <span className={styles.cardBadge}>Featured</span> : null}
                  </div>
                  <h2 className={styles.cardTitle}>
                    <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
                  </h2>
                </header>
                <p className={`${styles.cardSummary} u-max-w-prose`}>
                  {essay.summary ?? "Add a summary in the front matter to give readers a preview."}
                </p>
                <div className={styles.cardFooter}>
                  <Link className={styles.cardCta} href={`/essays/${essay.slug}`}>
                    Read essay
                  </Link>
                </div>
                <div className={styles.cardGlow} aria-hidden="true" />
              </article>
            </MotionFade>
          ))}
          {essays.length === 0 ? (
            <p className={styles.empty}>No essays published yet. Add `.mdx` files under `content/writing`.</p>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
