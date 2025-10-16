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

type HeroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

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
  images: {
    horizontal: HeroImage;
    vertical: HeroImage;
  };
  className?: string;
};

export function Hero({
  copy,
  ctas = [],
  images,
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
    <motion.section
      className={clsx(styles.hero, className)}
      variants={heroVariants}
      initial={resolvedInitial}
      animate={resolvedAnimate}
      {...motionProps}
    >
      <div className={styles.copy}>
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
      </div>
      <div className={styles.media}>
        <div className={styles.artwork}>
          <Image
            priority
            className={styles.verticalArt}
            src={images.vertical.src}
            alt={images.vertical.alt}
            width={images.vertical.width}
            height={images.vertical.height}
          />
          <Image
            priority
            className={styles.horizontalArt}
            src={images.horizontal.src}
            alt={images.horizontal.alt}
            width={images.horizontal.width}
            height={images.horizontal.height}
          />
        </div>
      </div>
    </motion.section>
  );
}

export default Hero;
