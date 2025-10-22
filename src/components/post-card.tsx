"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { type ReactNode, useMemo } from "react";

import type { BlogPostSummary } from "@/lib/mdx";
import {
  createFadeInUpVariants,
  motionDurations,
  useMotionVariants,
  viewportDefaults,
} from "@/lib/motion";

import elevatedSurfaceStyles from "./elevated-surface.module.scss";
import styles from "./card.module.scss";

export interface PostCardProps {
  summary: BlogPostSummary;
  href?: string;
  meta?: ReactNode;
  tags?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  className?: string;
  commentCount?: number | null;
}

export function PostCard({
  summary,
  href = `/writing/${summary.slug}`,
  meta,
  tags,
  description,
  cta,
  className,
  commentCount,
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

  const resolvedMeta = meta ?? defaultMeta;
  const resolvedTags = tags ?? defaultTags;

  const commentLabel =
    typeof commentCount === "number"
      ? (() => {
          const label = `${commentCount} ${commentCount === 1 ? "comment" : "comments"}`;
          return (
            <span className={styles.commentCount} aria-label={label}>
              <i className="fa-regular fa-comments" aria-hidden="true" />
              <span aria-hidden="true">{label}</span>
            </span>
          );
        })()
      : null;

  return (
    <motion.article
      className={clsx(
        elevatedSurfaceStyles.elevatedSurface,
        elevatedSurfaceStyles.elevatedSurfaceInteractive,
        styles.card,
        className,
      )}
      variants={variants}
      initial={resolvedInitial}
      whileInView="visible"
      viewport={viewportDefaults}
      whileHover={hoverMotion}
      whileTap={tapMotion}
    >
      <Link
        className={clsx(elevatedSurfaceStyles.elevatedSurfaceLink, styles.link)}
        href={href}
        aria-label={`Read writing: ${summary.title}`}
      >
        <header className={styles.header}>
          <div className={styles.metaRow}>
            {resolvedMeta}
            {commentLabel}
            {resolvedTags}
          </div>
          <h2 className={styles.title}>{summary.title}</h2>
        </header>
        {description ?? defaultDescription}
        <footer className={styles.cardFooter}>{cta ?? defaultCta}</footer>
      </Link>
    </motion.article>
  );
}
