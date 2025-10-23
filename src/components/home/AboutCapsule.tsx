"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

import MotionFade from "@/components/motion/MotionFade";
import { usePrefersReducedMotion, useRevealOnView } from "@/lib/motion";

import styles from "./AboutCapsule.module.scss";

import type { HomeSectionProps } from "./types";

const profileImageUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

export default function AboutCapsule({
  className,
  style,
}: HomeSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const observerOptions = useMemo<IntersectionObserverInit>(
    () => ({ threshold: 0.35 }),
    [],
  );

  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLElement>(
    shouldAnimate,
    observerOptions,
  );

  return (
    <section
      ref={sectionRef}
      id="section-home-aboutcapsule"
      className={clsx(
        styles.aboutSection,
        shouldAnimate && isVisible && styles.isVisible,
        className,
      )}
      data-home-section
      style={style}
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          <aside className={styles.rail}>
            <div className={styles.labelGroup}>
              <span className={clsx("u-eyebrow", styles.eyebrow)}>ABOUT</span>
            </div>
            <div className={styles.accentTrack} aria-hidden="true">
              <div className={styles.accentBar} />
            </div>
          </aside>

          <div className={styles.main}>
            <div className={styles.copy}>
              <MotionFade delay={0.18} duration={0.2} offset={10}>
                <h2 className={styles.heading}>Calm engineering under pressure</h2>
              </MotionFade>

              <MotionFade delay={0.24} duration={0.2} offset={10}>
                <p className={styles.firstParagraph}>
                  <span className={clsx("u-text-lead", styles.leadWord)}>
                    There’s
                  </span>{" "}
                  a moment when turbulence has to turn into control. That’s where I
                  work.
                </p>
              </MotionFade>

              <MotionFade delay={0.3} duration={0.2} offset={10}>
                <p>
                  I build systems that stay steady when things get unpredictable
                  {"\u200a—\u200a"}
                  the kind that keep automation, energy, and industry safe to rely
                  on. Decades of engineering have taught me that reliability isn’t a
                  by-product of technology; it’s the outcome of clarity, rehearsal,
                  and restraint.
                </p>
              </MotionFade>
              <p>
                My work is about keeping that clarity as automation grows more
                intelligent and the stakes rise. Making complexity calm. Turning
                risk into rhythm. Keeping everything that matters flying straight
                {"\u200a—\u200a"}
                <Link href="/about" className={styles.link}>
                  More →
                </Link>
              </p>
            </div>

            <MotionFade delay={0.32} duration={0.24} offset={12}>
              <figure className={styles.portrait} aria-label="Portrait of Paula Livingstone">
                <div className={styles.portraitGlow} aria-hidden="true" />
                <div className={styles.portraitFrame}>
                  <Image
                    src={profileImageUrl}
                    alt="Paula Livingstone"
                    className={styles.portraitImage}
                    width={520}
                    height={578}
                    sizes="(min-width: 1280px) 420px, (min-width: 1024px) 340px, (min-width: 768px) 260px, 200px"
                    priority={false}
                  />
                </div>
              </figure>
            </MotionFade>
          </div>
        </div>
      </div>
    </section>
  );
}
