"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import {
  createMotionVars,
  usePrefersReducedMotion,
  useRevealOnView,
} from "@/lib/motion";

import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";

import styles from "./about.module.scss";

const photoUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

const heroTraits = [
  {
    key: "optimist",
    title: "Optimist",
    description:
      "Hold to bright possibilities, steady under strain so calm, generous outcomes stay within reach.",
    glyph: "☀️",
  },
  {
    key: "engineer",
    title: "Engineer",
    description:
      "Shape resilient systems from first principles, refining the intricate until it feels inevitable.",
    glyph: "🛠️",
  },
  {
    key: "adventurer",
    title: "Adventurer",
    description:
      "Explore unfamiliar ground with measured courage, bringing back fresh insight that keeps momentum alive.",
    glyph: "🧭",
  },
] as const;

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const [heroReady, setHeroReady] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setHeroReady(true);
      return;
    }

    setHeroReady(false);

    const frame = requestAnimationFrame(() => {
      setHeroReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate]);

  const observerOptions = useMemo<IntersectionObserverInit>(
    () => ({ threshold: 0.2 }),
    [],
  );

  const { ref: biographyRef, isVisible: biographyVisible } = useRevealOnView<HTMLElement>(
    shouldAnimate,
    observerOptions,
  );

  return (
    <div className={styles.main}>
      <section
        className={clsx(
          styles.hero,
          shouldAnimate && "motionFade",
          shouldAnimate && heroReady && "motionFadeReady",
        )}
        style={createMotionVars(shouldAnimate, 0, 0, 0.6)}
      >
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p
              className={clsx(
                styles.eyebrow,
                shouldAnimate && "motionFade",
                shouldAnimate && heroReady && "motionFadeReady",
              )}
              style={createMotionVars(shouldAnimate, 0.15)}
            >
              ABOUT ME
            </p>

            <h1
              className={clsx(
                styles.heroTitle,
                shouldAnimate && "motionFade",
                shouldAnimate && heroReady && "motionFadeReady",
              )}
              style={createMotionVars(shouldAnimate, 0.22)}
            >
              <span className={styles.heroTitleWord}>Optimist</span>
              <span className={styles.heroTitleWord}>Engineer</span>
              <span className={styles.heroTitleWord}>Adventurer</span>
            </h1>

            <p
              className={clsx(
                styles.heroSubhead,
                shouldAnimate && "motionFade",
                shouldAnimate && heroReady && "motionFadeReady",
              )}
              style={createMotionVars(shouldAnimate, 0.32)}
            >
              Building calm in complex systems.
            </p>

            <p
              className={clsx(
                styles.heroIntro,
                shouldAnimate && "motionFade",
                shouldAnimate && heroReady && "motionFadeReady",
              )}
              style={createMotionVars(shouldAnimate, 0.38)}
            >
              I help build and secure automated systems and the networks that connect them. My focus is where operational
              technology and AI-driven automation meet—and where risk multiplies fastest.
            </p>
          </div>

          <div
            className={clsx(
              styles.heroPortrait,
              shouldAnimate && "motionFade",
              shouldAnimate && heroReady && "motionFadeReady",
            )}
            style={createMotionVars(shouldAnimate, 0.45, 12, 0.5)}
          >
            <div className={styles.portraitFrame}>
              <div className={styles.portraitMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Paula Livingstone" loading="lazy" />
              </div>
            </div>

            <div className={styles.heroBadgeCluster}>
              {badges.map((label) => (
                <span key={label} className={styles.badge}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={clsx(
            styles.heroCards,
            shouldAnimate && "motionFade",
            shouldAnimate && heroReady && "motionFadeReady",
          )}
          style={createMotionVars(shouldAnimate, 0.55, 18, 0.6)}
        >
          {heroTraits.map((trait, index) => (
            <article
              key={trait.key}
              className={clsx(
                elevatedSurfaceStyles.elevatedSurface,
                styles.heroCard,
                shouldAnimate && "motionFade",
                shouldAnimate && heroReady && "motionFadeReady",
              )}
              style={createMotionVars(shouldAnimate, 0.65 + index * 0.08, 14, 0.5)}
            >
              <span className={styles.heroCardGlyph} aria-hidden>
                {trait.glyph}
              </span>
              <h2 className={styles.heroCardTitle}>{trait.title}</h2>
              <p className={styles.heroCardBody}>{trait.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bodySection}>
        <article
          ref={biographyRef}
          className={clsx(
            styles.biography,
            shouldAnimate && "motionFade",
            shouldAnimate && biographyVisible && "motionFadeReady",
          )}
          style={createMotionVars(shouldAnimate, 0.15, 24, 0.5)}
        >
          <h2 className={styles.biographyHeading}>From RF to AI-secured automation</h2>
          {biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
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
    </div>
  );
}
