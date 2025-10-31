import clsx from "clsx";
import { Suspense } from "react";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";
import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import {
  getProjectDocument,
  getProjectSlugs,
  getProjectSummaries,
} from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import styles from "./page.module.scss";

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getProjectSlugs();
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectDocument(params.slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `${siteUrl}/projects/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectDocument(params.slug);

  if (!project) {
    notFound();
  }

  if (project.slug !== params.slug) {
    redirect(`/projects/${project.slug}`);
  }

  const otherProjects = (await getProjectSummaries()).filter(
    (item) => item.slug !== project.slug,
  );

  return (
    <PageShell as="main" className={clsx("u-pad-block-3xl", styles.page)}>
      <article className={styles.article}>
        <nav
          aria-label="Breadcrumb"
          className={clsx("u-text-sm", styles.breadcrumb)}
        >
          <Link
            className="u-inline-flex u-items-center u-gap-xs"
            href="/projects"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Back to all projects</span>
          </Link>
        </nav>

        <MotionFade>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <span className={styles.heroEyebrow}>Client engagement</span>
              <h1 className={styles.heroTitle}>{project.title}</h1>
              <p className={styles.heroSummary}>{project.summary}</p>
              <dl className={styles.heroStats}>
                <div className={styles.heroStatCard}>
                  <dt className={styles.heroStatLabel}>Delivered</dt>
                  <dd className={styles.heroStatValue}>
                    {format(new Date(project.date), "MMMM d, yyyy")}
                  </dd>
                </div>
                {project.role ? (
                  <div className={styles.heroStatCard}>
                    <dt className={styles.heroStatLabel}>Role</dt>
                    <dd className={styles.heroStatValue}>{project.role}</dd>
                  </div>
                ) : null}
                {project.status ? (
                  <div className={styles.heroStatCard}>
                    <dt className={styles.heroStatLabel}>Status</dt>
                    <dd className={styles.heroStatValue}>{project.status}</dd>
                  </div>
                ) : null}
              </dl>
              {project.stack?.length ? (
                <ul className={styles.heroStack}>
                  {project.stack.map((tech) => (
                    <li key={tech} className={styles.heroStackItem}>
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        </MotionFade>

        <MotionFade delay={0.05}>
          <section className={clsx(styles.surface)}>
            <div className={clsx("prose", styles.bodyProse)}>{project.content}</div>
          </section>
        </MotionFade>

        <MotionFade delay={0.1}>
          <section
            className={clsx(styles.surface, styles.discussion)}
            aria-labelledby="comments-heading"
          >
            <h2
              id="comments-heading"
              className={clsx("heading-subtitle", styles.discussionHeading)}
            >
              Join the discussion
            </h2>
            <CommentProvider slug={project.slug}>
              <CommentForm slug={project.slug} />
              <Suspense fallback={null}>
                <CommentList slug={project.slug} />
              </Suspense>
            </CommentProvider>
          </section>
        </MotionFade>

        {otherProjects.length > 0 ? (
          <MotionFade delay={0.1}>
            <aside
              className={clsx(
                elevatedSurfaceStyles.elevatedSurface,
                "u-pad-xl u-stack u-gap-sm",
              )}
            >
              <h2 className="heading-subtitle u-text-muted">
                More client work
              </h2>
              <ul className="u-stack u-gap-sm">
                {otherProjects.map((other) => (
                  <li key={other.slug}>
                    <Link
                      className="u-stack u-gap-2xs"
                      href={`/projects/${other.slug}`}
                    >
                      <span className="u-font-semibold">{other.title}</span>
                      <span className="u-text-muted u-text-sm">
                        {other.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </MotionFade>
        ) : null}
      </article>
    </PageShell>
  );
}
