"use client";

import type { MotionProps } from "framer-motion";
import { motion } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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
  transition,
  ...motionProps
}: HeroProps) {
  const defaultInitial = { opacity: 0, y: 24 } satisfies MotionProps["initial"];
  const defaultAnimate = {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", ...(transition ?? {}) },
  } satisfies MotionProps["animate"];

  const finalAnimate = animate ?? defaultAnimate;

  return (
    <motion.section
      className={clsx(styles.hero, className)}
      initial={initial ?? defaultInitial}
      animate={finalAnimate}
      transition={animate ? transition : undefined}
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
