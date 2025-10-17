"use client";

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import AboutBadges from "@/components/about/AboutBadges";
import PrincipleCard from "@/components/about/PrincipleCard";
import {
  createFadeInUpVariants,
  motionDurations,
  motionEasings,
  useMotionVariants,
  viewportDefaults,
} from "@/lib/motion";
import analytics from "@/lib/analytics/posthog";

import styles from "./about.module.scss";

type Principle = {
  title: string;
  body: string;
};

type AboutPageContentProps = {
  badges: readonly string[];
  biography: readonly string[];
  principles: readonly Principle[];
  closingStatement: string;
};

const heroVariants = createFadeInUpVariants({
  duration: motionDurations.base,
  offset: 16,
});

const heroEyebrowVariants = createFadeInUpVariants({
  duration: motionDurations.long,
  offset: 24,
});

const heroTitleVariants = createFadeInUpVariants({
  delay: 0.04,
  duration: motionDurations.long,
  offset: 24,
});

const heroSubheadVariants = createFadeInUpVariants({
  delay: 0.08,
  duration: motionDurations.long,
  offset: 24,
});

const heroCopyVariants = createFadeInUpVariants({
  delay: 0.16,
  duration: motionDurations.long,
  offset: 24,
});

const columnVariants = createFadeInUpVariants({
  duration: motionDurations.long,
  offset: 32,
});

const constantsCardVariants = createFadeInUpVariants({
  duration: motionDurations.base,
  offset: 24,
});

export function AboutPageContent({ badges, biography, principles, closingStatement }: AboutPageContentProps) {
  const { variants: heroMotion, shouldReduceMotion } = useMotionVariants(heroVariants);
  const heroEyebrowMotion = useMotionVariants(heroEyebrowVariants).variants;
  const heroTitleMotion = useMotionVariants(heroTitleVariants).variants;
  const heroSubheadMotion = useMotionVariants(heroSubheadVariants).variants;
  const heroCopyMotion = useMotionVariants(heroCopyVariants).variants;
  const columnMotion = useMotionVariants(columnVariants).variants;
  const constantsMotion = useMotionVariants(constantsCardVariants).variants;

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const tracker = (analytics as unknown as { track?: (event: string, properties?: Record<string, unknown>) => void }).track;
    if (typeof tracker === "function") {
      tracker("about_viewed");
      return;
    }

    if (typeof analytics.capture === "function") {
      analytics.capture("about_viewed");
    }
  }, []);

  const gridMotion = useMemo(() => {
    if (shouldReduceMotion || reducedMotion) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };
    }

    return {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionDurations.base,
          ease: motionEasings.standard,
          staggerChildren: 0.18,
          delayChildren: 0.12,
        },
      },
    };
  }, [reducedMotion, shouldReduceMotion]);

  return (
    <div className="l-container">
      <div className={styles.page}>
        <motion.section
          className={styles.hero}
          variants={heroMotion}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
        >
          <div className={styles.heroInner}>
            <motion.span className={styles.eyebrow} variants={heroEyebrowMotion}>
              ABOUT
            </motion.span>
            <motion.h1 className={styles.title} variants={heroTitleMotion}>
              Building calm in complex systems
            </motion.h1>
            <motion.p className={styles.subhead} variants={heroSubheadMotion}>
              I am an engineer who helps build and secure automated systems and the interconnected networks that run them.
              My focus is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the
              blast radius.
            </motion.p>
          </div>
        </motion.section>

        <motion.section
          className={styles.layout}
          variants={gridMotion}
          initial={shouldReduceMotion || reducedMotion ? "visible" : "hidden"}
          animate="visible"
        >
          <motion.div className={styles.portraitCard} variants={columnMotion}>
            <div className={styles.portraitImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg"
                alt="Paula Livingstone"
                className={styles.portraitImage}
                loading="lazy"
                width={800}
                height={1000}
              />
            </div>
            <div className={styles.badgeRow}>
              <AboutBadges labels={badges} />
            </div>
          </motion.div>

          <motion.article className={styles.bio} variants={columnMotion} aria-labelledby="about-story-heading">
            <h2 id="about-story-heading">From RF to AI-secured automation</h2>
            {biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </motion.article>
        </motion.section>

        <section className={styles.constantsSection} aria-labelledby="constants-heading">
          <motion.h2
            className={styles.constantsHeading}
            variants={heroCopyMotion}
            initial="hidden"
            whileInView="visible"
            viewport={viewportDefaults}
          >
            Constants
          </motion.h2>
          <div className={styles.constantsGrid}>
            {principles.map((principle) => (
              <motion.div
                key={principle.title}
                variants={constantsMotion}
                initial="hidden"
                whileInView="visible"
                viewport={viewportDefaults}
              >
                <PrincipleCard title={principle.title} body={principle.body} />
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          className={styles.closingCard}
          variants={heroCopyMotion}
          initial="hidden"
          whileInView="visible"
          viewport={viewportDefaults}
        >
          <p className={styles.closingBody}>{closingStatement}</p>
        </motion.section>
      </div>
    </div>
  );
}

export default AboutPageContent;
