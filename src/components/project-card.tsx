"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

import type { ProjectSummary } from "@/lib/mdx";
import {
  createFadeInUpVariants,
  motionDurations,
  useMotionVariants,
  viewportDefaults,
} from "@/lib/motion";

import styles from "./card.module.scss";

export interface ProjectCardProps {
  summary: ProjectSummary;
  href?: string;
  meta?: ReactNode;
  status?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  details?: ReactNode;
  className?: string;
}

export function ProjectCard({
  summary,
  href = `/projects/${summary.slug}`,
  meta,
  status,
  description,
  cta,
  details,
  className,
}: ProjectCardProps) {
  const baseVariants = useMemo(
    () =>
      createFadeInUpVariants({
        duration: motionDurations.long,
        offset: 32,
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
    <time dateTime={summary.date} aria-label="Project date">
      {format(new Date(summary.date), "MMMM yyyy")}
    </time>
  );

  const defaultStatus = summary.status ? (
    <span className={styles.badge} aria-label="Project status">
      {summary.status}
    </span>
  ) : null;

  const defaultDescription = summary.summary ? (
    <p className={styles.description}>{summary.summary}</p>
  ) : null;

  const defaultDetails = summary.role || summary.stack?.length ? (
    <div className={styles.details}>
      {summary.role ? (
        <p>
          <strong>Role</strong>
          <br />
          {summary.role}
        </p>
      ) : null}
      {summary.stack?.length ? (
        <p>
          <strong>Stack</strong>
          <br />
          {summary.stack.join(", ")}
        </p>
      ) : null}
    </div>
  ) : null;

  const defaultCta = (
    <span className={styles.cta}>
      View project <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
        aria-label={`View project case study: ${summary.title}`}
      >
        <header className={styles.header}>
          <div className={styles.metaRow}>
            {meta ?? defaultMeta}
            {status ?? defaultStatus}
          </div>
          <h2 className={styles.title}>{summary.title}</h2>
        </header>
        {description ?? defaultDescription}
        {details ?? defaultDetails}
        <footer className={styles.cardFooter}>{cta ?? defaultCta}</footer>
      </Link>
    </motion.article>
  );
}
