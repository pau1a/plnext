"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from "react";

import {
  createMotionVars,
  usePrefersReducedMotion,
  useRevealOnView,
} from "@/lib/motion";

import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";

import styles from "./about.module.scss";

const photoUrl =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

type PolaroidSpec = {
  src: string;
  alt: string;
  rotation: number;
};

const polaroidImages: PolaroidSpec[] = [
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/prejump.jpg",
    alt: "Gear check on the drop zone before a jump.",
    rotation: -12,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/portugalfreefall.jpg",
    alt: "Freefall over the Portuguese coast.",
    rotation: 9,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/lookup.jpg",
    alt: "Looking up at the canopy mid-flight.",
    rotation: -7,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/landers.jpg",
    alt: "Landing team regrouping on the field.",
    rotation: 11,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/IMG_2040.jpeg",
    alt: "Toolkit prep on the tailgate of the truck.",
    rotation: -6,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/IMG_1409.jpeg",
    alt: "Night operations brief under the hangar lights.",
    rotation: 13,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/helo.jpg",
    alt: "Helicopter pickup on the ridge line.",
    rotation: -18,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/freefall.jpg",
    alt: "Tracking through the clouds.",
    rotation: 8,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/flare.jpg",
    alt: "Flaring for landing at dusk.",
    rotation: -9,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/climb.jpg",
    alt: "Climbing out on the wing strut.",
    rotation: 7,
  },
  {
    src: "https://cdn.networklayer.co.uk/paulalivingstone/images/army.jpg",
    alt: "With the engineering team at the test range.",
    rotation: -5,
  },
];

const topClusterSlots = [
  { top: 18, left: 18, width: 22, rotation: -12, zIndex: 3 },
  { top: 32, left: 40, width: 20, rotation: 6, zIndex: 2 },
  { top: 12, left: 62, width: 18, rotation: -4, zIndex: 4 },
  { top: 38, left: 78, width: 21, rotation: 11, zIndex: 3 },
  { top: 24, left: 92, width: 19, rotation: -8, zIndex: 5 },
  { top: 42, left: 56, width: 22, rotation: 7, zIndex: 2 },
];

const bottomClusterSlots = [
  { top: 18, left: 16, width: 21, rotation: 10, zIndex: 3 },
  { top: 36, left: 28, width: 19, rotation: -9, zIndex: 2 },
  { top: 22, left: 50, width: 23, rotation: 6, zIndex: 4 },
  { top: 14, left: 72, width: 20, rotation: -7, zIndex: 3 },
  { top: 36, left: 86, width: 22, rotation: 5, zIndex: 5 },
  { top: 24, left: 60, width: 21, rotation: -12, zIndex: 2 },
];

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

  const [topPolaroids, setTopPolaroids] = useState<PolaroidSpec[]>(
    polaroidImages.slice(0, 5),
  );
  const [bottomPolaroids, setBottomPolaroids] = useState<PolaroidSpec[]>(
    polaroidImages.slice(5),
  );
  const [topClusterGap, setTopClusterGap] = useState<number | null>(null);
  const [bottomClusterGap, setBottomClusterGap] = useState<number | null>(null);

  useEffect(() => {
    const images = [...polaroidImages];

    for (let i = images.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    setTopPolaroids(images.slice(0, 5));
    setBottomPolaroids(images.slice(5));
  }, []);

  const topClusterRef = useRef<HTMLDivElement | null>(null);
  const bottomClusterRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    function clampValue(min: number, pref: number, max: number) {
      return Math.max(min, Math.min(pref, max));
    }

    function evaluateSpacing() {
      if (!topClusterRef.current || !bottomClusterRef.current || !headingRef.current || !biographyRef.current) {
        return;
      }

      const topRect = topClusterRef.current.getBoundingClientRect();
      const bottomRect = bottomClusterRef.current.getBoundingClientRect();

      if (topRect.width === 0 && bottomRect.width === 0) {
        setTopClusterGap(null);
        setBottomClusterGap(null);
        return;
      }

      const headingRect = headingRef.current.getBoundingClientRect();
      const biographyRect = biographyRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const topBase = clampValue(6.5 * 16, viewportWidth * 0.13, 9.1 * 16); // px
      const desiredTopGap = Math.max(topBase, 16);
      const currentTopGap = headingRect.top - topRect.bottom;
      const resolvedTopGap = currentTopGap >= desiredTopGap ? currentTopGap : desiredTopGap;

      const bottomBase = clampValue(6.5 * 16, viewportWidth * 0.13, 9.1 * 16);
      const desiredBottomGap = Math.max(bottomBase, 16);
      const currentBottomGap = bottomRect.top - biographyRect.bottom;
      const resolvedBottomGap = currentBottomGap >= desiredBottomGap ? currentBottomGap : desiredBottomGap;

      setTopClusterGap(resolvedTopGap);
      setBottomClusterGap(resolvedBottomGap);
    }

    const run = () => evaluateSpacing();
    const raf = requestAnimationFrame(run);
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", run);
    };
  }, [topPolaroids, bottomPolaroids, biographyRef, headingRef]);

  return (
    <main className={styles.main}>
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
        <div className={styles.biographyLayout}>
          <div
            ref={topClusterRef}
            className={styles.polaroidClusterTop}
            aria-hidden="true"
            style={topClusterGap ? { marginBottom: `${topClusterGap * 0.75}px` } : undefined}
          >
            {topPolaroids.map((photo, index) => {
              const slot = topClusterSlots[index % topClusterSlots.length];
              return (
                <figure
                  key={`top-${photo.src}`}
                  className={styles.polaroid}
                  style={
                    {
                      "--cluster-top": `${slot.top}%`,
                      "--cluster-left": `${slot.left}%`,
                      "--photo-size": `${slot.width}%`,
                      "--rotation": `${slot.rotation + photo.rotation}deg`,
                      "--photo-z": slot.zIndex,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={photo.src}
                    alt=""
                    width={800}
                    height={900}
                    sizes="(min-width: 1200px) 320px, (min-width: 992px) 280px, 220px"
                    className={styles.polaroidImage}
                    priority={index < 2}
                  />
                </figure>
              );
            })}
          </div>

          <article
            ref={biographyRef}
            className={clsx(
              styles.biography,
              shouldAnimate && "motionFade",
              shouldAnimate && biographyVisible && "motionFadeReady",
            )}
            style={createMotionVars(shouldAnimate, 0.15, 24, 0.5)}
          >
            <h2 ref={headingRef} className={styles.biographyHeading}>
              From RF to AI-secured automation
            </h2>
            {biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <div
            ref={bottomClusterRef}
            className={styles.polaroidClusterBottom}
            aria-hidden="true"
            style={bottomClusterGap ? { marginTop: `${bottomClusterGap * 1.5}px` } : undefined}
          >
            {bottomPolaroids.map((photo, index) => {
              const slot = bottomClusterSlots[index % bottomClusterSlots.length];
              return (
                <figure
                  key={`bottom-${photo.src}`}
                  className={styles.polaroid}
                  style={
                    {
                      "--cluster-top": `${slot.top}%`,
                      "--cluster-left": `${slot.left}%`,
                      "--photo-size": `${slot.width}%`,
                      "--rotation": `${slot.rotation + photo.rotation}deg`,
                      "--photo-z": slot.zIndex,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={photo.src}
                    alt=""
                    width={800}
                    height={900}
                    sizes="(min-width: 1200px) 320px, (min-width: 992px) 280px, 220px"
                    className={styles.polaroidImage}
                    priority={false}
                  />
                </figure>
              );
            })}
          </div>

          <div className={styles.photoCarousel}>
            {[...topPolaroids, ...bottomPolaroids].map((photo, index) => (
              <figure
                key={`mobile-${photo.src}`}
                className={styles.polaroidMobile}
                style={{ "--rotate": `${photo.rotation / 2}deg` } as CSSProperties}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={520}
                  height={578}
                  sizes="(min-width: 48rem) 220px, 70vw"
                  className={styles.polaroidImage}
                  priority={index < 2}
                />
              </figure>
            ))}
          </div>
        </div>
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
        <p className={styles.streamNote}>
          I occasionally post brief thoughts and observations in my {" "}
          <Link href="/stream">Stream</Link>&mdash;fragments, notes, and in-progress ideas.
        </p>
        <p className={styles.streamNote}>
          For how I approach engineering, see my {" "}
          <Link href="/philosophy">Philosophy</Link>.
        </p>
        <p className={styles.streamNote}>
          For what I’m currently focused on, see my {" "}
          <Link href="/now">Now page</Link>.
        </p>
        <p className={styles.streamNote}>
          Annotated reading lives in the {" "}
          <Link href="/library">Library</Link>.
        </p>
      </section>
    </main>
  );
}
