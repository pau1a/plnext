"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import styles from "./about.module.scss";

const photoUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

const heroSummaryHighlights = [
  "Industrial automation and AI security.",
  "Measurement-led, code-first controls.",
  "Layered defence for calm recovery.",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

type AboutPageContentProps = {
  badges: readonly string[];
  biography: readonly string[];
  principles: readonly { title: string; body: string }[];
  closingStatement: string;
};

export default function AboutPageContent({
  badges,
  biography,
  principles,
  closingStatement,
}: AboutPageContentProps) {
  const shouldReduceMotion = useReducedMotion();

  const heroMotion = useMemo(
    () =>
      shouldReduceMotion
        ? { initial: false, animate: false }
        : { variants: fadeUp, initial: "hidden" as const, animate: "show" as const },
    [shouldReduceMotion],
  );

  const articleMotion = useMemo(
    () =>
      shouldReduceMotion
        ? { initial: false, whileInView: undefined }
        : {
            variants: fadeUp,
            initial: "hidden" as const,
            whileInView: "show" as const,
            viewport: { once: true, amount: 0.2 },
          },
    [shouldReduceMotion],
  );

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <motion.p {...heroMotion} className={styles.eyebrow}>
              ABOUT
            </motion.p>

            <motion.h1 {...heroMotion} className={styles.heroTitle}>
              Building calm in complex systems
            </motion.h1>

            <motion.p {...heroMotion} className={styles.heroSubhead}>
              I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My
              focus is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast
              radius.
            </motion.p>
          </div>

          <motion.div {...heroMotion} className={styles.heroSummary}>
            <div className={styles.heroSummaryCard}>
              <div className={styles.heroSummarySwatch} aria-hidden="true" />
              <div className={styles.heroSummaryContent}>
                <p className={styles.heroSummaryEyebrow}>At a glance</p>
                <div className={styles.heroSummaryHighlights}>
                  {heroSummaryHighlights.map((highlight) => (
                    <div key={highlight} className={styles.heroSummaryHighlight}>
                      <span
                        className={styles.heroSummaryAccent}
                        aria-hidden="true"
                      />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </section>

      <section className={styles.bodySection}>
        <motion.article {...articleMotion} className={styles.biography}>
          <div className={styles.biographyAside}>
            <div className={styles.portraitCard}>
              <div className={styles.portraitMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Paula Livingstone" loading="lazy" />
              </div>
            </div>

            <div className={styles.badgeCluster}>
              {badges.map((label) => (
                <span key={label} className={styles.badge}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <h2 className={styles.biographyHeading}>From RF to AI-secured automation</h2>
          {biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.article>
      </section>

      <section className={styles.constantsSection}>
        <h2 className={styles.constantsHeading}>Constants</h2>
        <div className={styles.constantsDivider} aria-hidden="true" />
        <div className={styles.constantsGrid}>
          {principles.map((item) => (
            <div key={item.title} className={styles.principleCard}>
              <div className={styles.principleAccent} />
              <div className={styles.principleHeader}>{item.title}</div>
              <p className={styles.principleBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.closerSection}>
        <div className={styles.closerCard}>
          <p>{closingStatement}</p>
        </div>
      </section>
    </main>
  );
}
