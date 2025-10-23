"use client";

import clsx from "clsx";
import type { MotionProps } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

import {
  createFadeInUpVariants,
  motionDurations,
  useMotionVariants,
} from "@/lib/motion";

import styles from "@/styles/hero.module.scss";

type HeroCopy = {
  eyebrow?: string;
  title: string;
  description: string;
  subheading?: string;
};

type HeroCta = {
  label: string;
  href: string;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
};

type HeroProps = MotionProps & {
  copy: HeroCopy;
  ctas?: HeroCta[];
  className?: string;
};

export function Hero({
  copy,
  ctas = [],
  className,
  initial,
  animate,
  ...motionProps
}: HeroProps) {
  const baseVariants = useMemo(
    () =>
      createFadeInUpVariants({
        duration: motionDurations.long,
        offset: 40,
      }),
    []
  );
  const { variants: heroVariants, shouldReduceMotion } = useMotionVariants(baseVariants);

  const resolvedInitial = initial ?? (shouldReduceMotion ? "visible" : "hidden");
  const resolvedAnimate = animate ?? "visible";

  return (
    <section className={clsx(styles.hero, className)}>
      <div className={styles.heroMedia}>
        <Image
          src="https://cdn.networklayer.co.uk/paulalivingstone/images/freefall.jpg"
          alt="Paula Livingstone in freefall — precision under pressure"
          fill
          priority
          unoptimized
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAoKCgkLCgkKDRcNDhANDg8NFREWFhURExMYHSggGBolHRUTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGi0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAABv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEAMQAAAB9AA//8QAGRAAAgMBAAAAAAAAAAAAAAAAAQIAERMx/9oACAEBAAE/AGX5i5cqOK//xAAWEQADAAAAAAAAAAAAAAAAAAABACH/2gAIAQMBAT8AYf/EABYRAQEBAAAAAAAAAAAAAAAAAAEAEf/aAAgBAgEBPwCxl//EABoQAQACAgMAAAAAAAAAAAAAAAEAESExQXH/2gAIAQEABj8C2nVjXjzIg1YQn//EABkQAQACAwAAAAAAAAAAAAAAAAEAESHx0f/aAAgBAQABPyHTifMumB8d9bUEpQqj/2gAMAwEAAgADAAAAEB//xAAWEQEBAQAAAAAAAAAAAAAAAAABABH/2gAIAQMBAT8Qxf/EABcRAQEBAQAAAAAAAAAAAAAAAAEAERL/2gAIAQIBAT8QEms//8QAGxABAAMBAAMAAAAAAAAAAAAAAQARITFBUXH/2gAIAQEAAT8Qhe4wEa8R0xEKLThg4gS0F1eq//9k="
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <div className={styles.heroOverlay} />
      <motion.div
        className={styles.heroContent}
        variants={heroVariants}
        initial={resolvedInitial}
        animate={resolvedAnimate}
        {...motionProps}
      >
        {copy.eyebrow ? <span className={styles.eyebrow}>{copy.eyebrow}</span> : null}
        <h1 className={styles.heading}>{copy.title}</h1>
        {copy.subheading ? (
          <p className={styles.subheading}>{copy.subheading}</p>
        ) : null}
        <p className={styles.lead}>{copy.description}</p>
        {ctas.length > 0 ? (
          <div className={styles.ctaGroup}>
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={clsx(
                  "button",
                  cta.variant === "ghost" ? "button--ghost" : "button--primary",
                  "button--lg",
                  styles.cta
                )}
              >
                {cta.icon}
                <span>{cta.label}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}

export default Hero;
