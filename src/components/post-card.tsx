"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

import type { BlogPostSummary } from "@/lib/mdx";
import {
  createFadeInUpVariants,
  motionDurations,
  useMotionVariants,
  viewportDefaults,
} from "@/lib/motion";

import styles from "./card.module.scss";

export interface PostCardProps {
  summary: BlogPostSummary;
  href?: string;
  meta?: ReactNode;
  tags?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  className?: string;
}

export function PostCard({
  summary,
  href = `/blog/${summary.slug}`,
  meta,
  tags,
  description,
  cta,
  className,
}: PostCardProps) {
  const baseVariants = useMemo(
    () =>
      createFadeInUpVariants({
        duration: motionDurations.base,
        offset: 28,
      }),
    []
  );
  const { variants, shouldReduceMotion } = useMotionVariants(baseVariants);

  const hoverMotion = shouldReduceMotion
    ? undefined
    : {
        y: -6,
        transition: { duration: motionDurations.short },
      };
  const tapMotion = shouldReduceMotion
    ? undefined
    : {
        y: -2,
        transition: { duration: motionDurations.xshort },
      };
  const resolvedInitial = shouldReduceMotion ? "visible" : "hidden";

  const defaultMeta = (
    <time dateTime={summary.date} aria-label="Publication date">
      {format(new Date(summary.date), "MMMM d, yyyy")}
    </time>
  );

  const defaultTags = summary.tags?.length ? (
    <ul className={styles.badgeList} aria-label="Post tags">
      {summary.tags.map((tag) => (
        <li key={tag} className={styles.badge}>
          {tag}
        </li>
      ))}
    </ul>
  ) : null;

  const defaultDescription = summary.description ? (
    <p className={styles.description}>{summary.description}</p>
  ) : null;

  const defaultCta = (
    <span className={styles.cta}>
      Read article <i className="fa-solid fa-arrow-right" aria-hidden="true" />
    </span>
  );

  return (
    <motion.article
      className={clsx("surface", "surface--interactive", styles.card, className)}
      variants={variants}
      initial={resolvedInitial}
      whileInView="visible"
      viewport={viewportDefaults}
      whileHover={hoverMotion}
      whileTap={tapMotion}
    >
      <Link
        className={clsx("surface__link", styles.link)}
        href={href}
        aria-label={`Read blog post: ${summary.title}`}
      >
        <header className={styles.header}>
          <div className={styles.metaRow}>
            {meta ?? defaultMeta}
            {tags ?? defaultTags}
          </div>
          <h2 className={styles.title}>{summary.title}</h2>
        </header>
        {description ?? defaultDescription}
        <footer className={styles.cardFooter}>{cta ?? defaultCta}</footer>
      </Link>
    </motion.article>
  );
}
