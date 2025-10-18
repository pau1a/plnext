"use client";

import clsx from "clsx";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./about.module.scss";

const photoUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

type MotionVars = CSSProperties & {
  "--motion-delay"?: string;
  "--motion-duration"?: string;
  "--motion-ease"?: string;
  "--motion-offset"?: string;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useRevealOnView<T extends HTMLElement>(
  enabled: boolean,
  options: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const target = ref.current;

    if (!target) {
      return;
    }

    let didCancel = false;

    const observer = new IntersectionObserver((entries, observerRef) => {
      entries.forEach((entry) => {
        if (!didCancel && entry.isIntersecting) {
          setIsVisible(true);
          observerRef.disconnect();
        }
      });
    }, options);

    observer.observe(target);

    return () => {
      didCancel = true;
      observer.disconnect();
    };
  }, [enabled, options]);

  return { ref, isVisible } as const;
}

function createMotionVars(
  shouldAnimate: boolean,
  delay: number,
  offset = 10,
  duration = 0.4,
): MotionVars | undefined {
  if (!shouldAnimate) {
    return undefined;
  }

  return {
    "--motion-delay": `${delay}s`,
    "--motion-duration": `${duration}s`,
    "--motion-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
    "--motion-offset": `${offset}px`,
  } satisfies MotionVars;
}

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
    <main className={styles.main}>
      <section
        className={clsx(
          styles.hero,
          shouldAnimate && styles.motionFade,
          shouldAnimate && heroReady && styles.motionFadeReady,
        )}
        style={createMotionVars(shouldAnimate, 0, 0, 0.6)}
      >
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p
              className={clsx(
                styles.eyebrow,
                shouldAnimate && styles.motionFade,
                shouldAnimate && heroReady && styles.motionFadeReady,
              )}
              style={createMotionVars(shouldAnimate, 0.15)}
            >
              ABOUT ME
            </p>

            <h1
              className={clsx(
                styles.heroTitle,
                shouldAnimate && styles.motionFade,
                shouldAnimate && heroReady && styles.motionFadeReady,
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
                shouldAnimate && styles.motionFade,
                shouldAnimate && heroReady && styles.motionFadeReady,
              )}
              style={createMotionVars(shouldAnimate, 0.32)}
            >
              Building calm in complex systems.
            </p>

            <p
              className={clsx(
                styles.heroIntro,
                shouldAnimate && styles.motionFade,
                shouldAnimate && heroReady && styles.motionFadeReady,
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
              shouldAnimate && styles.motionFade,
              shouldAnimate && heroReady && styles.motionFadeReady,
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
      </section>

      <section className={styles.bodySection}>
        <article
          ref={biographyRef}
          className={clsx(
            styles.biography,
            shouldAnimate && styles.motionFade,
            shouldAnimate && biographyVisible && styles.motionFadeReady,
          )}
          style={createMotionVars(shouldAnimate, 0.15, 24, 0.5)}
        >
          <div className={styles.biographyAside}>
            <div className={styles.portraitCard}>
              <div className={styles.portraitMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Paula Livingstone" loading="lazy" />
              </div>
            </div>
          </div>

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
    </main>
  );
}
