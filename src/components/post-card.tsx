import clsx from "clsx";
import { format } from "date-fns";
import Link from "next/link";
import type { ReactNode } from "react";

import type { BlogPostSummary } from "@/lib/mdx";

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
    <article className={clsx("surface", "surface--interactive", styles.card, className)}>
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
    </article>
  );
}
