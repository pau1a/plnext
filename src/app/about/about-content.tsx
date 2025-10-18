"use client";

import { useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MotionProps, Transition } from "framer-motion";

import styles from "./about.module.scss";

const photoUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

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

  const heroEase = useMemo<Transition>(
    () => ({
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    }),
    [],
  );

  const heroContainerMotion = useMemo<MotionProps>(() => {
    if (shouldReduceMotion) {
      return { initial: false, animate: { opacity: 1 } };
    }

    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { ...heroEase, duration: 0.6 },
      },
    };
  }, [shouldReduceMotion, heroEase]);

  const buildHeroMotion = useCallback(
    (delay: number, offset = 10): MotionProps => {
      if (shouldReduceMotion) {
        return { initial: false, animate: { opacity: 1, y: 0 } };
      }

      return {
        initial: { opacity: 0, y: offset },
        animate: {
          opacity: 1,
          y: 0,
          transition: { ...heroEase, delay },
        },
      };
    },
    [shouldReduceMotion, heroEase],
  );

  const heroEyebrowMotion = useMemo<MotionProps>(() => buildHeroMotion(0.15), [buildHeroMotion]);

  const heroHeadlineMotion = useMemo<MotionProps>(
    () => buildHeroMotion(0.22),
    [buildHeroMotion],
  );

  const heroBodyMotion = useMemo<MotionProps>(
    () => buildHeroMotion(0.32),
    [buildHeroMotion],
  );

  const heroIntroMotion = useMemo<MotionProps>(
    () => buildHeroMotion(0.38),
    [buildHeroMotion],
  );

  const heroPortraitMotion = useMemo<MotionProps>(
    () => buildHeroMotion(0.45, 12),
    [buildHeroMotion],
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
      <motion.section className={styles.hero} {...heroContainerMotion}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <motion.p {...heroEyebrowMotion} className={styles.eyebrow}>
              ABOUT ME
            </motion.p>

            <motion.h1 {...heroHeadlineMotion} className={styles.heroTitle}>
              <span className={styles.heroTitleWord}>Optimist</span>
              <span className={styles.heroTitleWord}>Engineer</span>
              <span className={styles.heroTitleWord}>Adventurer</span>
            </motion.h1>

            <motion.p {...heroBodyMotion} className={styles.heroSubhead}>
              Building calm in complex systems.
            </motion.p>

            <motion.p {...heroIntroMotion} className={styles.heroIntro}>
              I help build and secure automated systems and the networks that connect them. My focus is where operational
              technology and AI-driven automation meet—and where risk multiplies fastest.
            </motion.p>
          </div>

          <motion.div className={styles.heroPortrait} {...heroPortraitMotion}>
            <div className={styles.portraitFrame}>
              <div className={styles.portraitMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Paula Livingstone" loading="lazy" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

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
