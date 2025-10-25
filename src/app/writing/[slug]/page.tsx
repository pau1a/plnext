import clsx from "clsx";
import { Suspense } from "react";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";
import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { getBlogPost, getBlogPostSummaries, getBlogSlugs } from "@/lib/mdx";
import { formatTagLabel } from "@/lib/tags";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface BlogPostPageParams {
  slug: string;
}

type BlogPostPageParamsInput = BlogPostPageParams | Promise<BlogPostPageParams>;

interface BlogPostPageProps {
  params: BlogPostPageParamsInput;
}

async function resolveParams(
  params: BlogPostPageParamsInput,
): Promise<BlogPostPageParams> {
  if (typeof (params as Promise<BlogPostPageParams>).then === "function") {
    return params as Promise<BlogPostPageParams>;
  }

  return params as BlogPostPageParams;
}

export async function generateStaticParams() {
  return getBlogSlugs();
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const publishedAt = new Date(post.date).toISOString();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";
  const canonicalPath = `/writing/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      publishedTime: publishedAt,
      title: post.title,
      description: post.description,
      url: canonicalPath,
      tags: post.tags,
      images: [
        {
          url: `${siteUrl}/window.svg`,
          width: 1200,
          height: 630,
          alt: "Paula Livingstone window mark",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${siteUrl}/window.svg`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await resolveParams(params);

  let postError: Error | null = null;
  const post = await getBlogPost(slug).catch((error) => {
    const resolvedError =
      error instanceof Error ? error : new Error(String(error));
    postError = resolvedError;
    console.error(`Failed to load blog post ${slug}:`, resolvedError);
    return null;
  });

  if (!post && !postError) {
    notFound();
  }

  let relatedPosts: Awaited<ReturnType<typeof getBlogPostSummaries>> = [];
  try {
    const summaries = await getBlogPostSummaries();
    relatedPosts = summaries
      .filter((item) => item.slug !== post?.slug)
      .slice(0, 3);
  } catch (error) {
    const resolvedError =
      error instanceof Error ? error : new Error(String(error));
    console.error("Failed to load related posts:", resolvedError);
    relatedPosts = [];
  }

  if (postError) {
    return (
      <PageShell as="main" className="u-pad-block-3xl">
        <article className="u-stack u-gap-2xl u-max-w-lg u-center">
          <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
            <Link
              className="u-inline-flex u-items-center u-gap-xs"
              href="/writing"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              <span>Back to all writing</span>
            </Link>
          </nav>

          <MotionFade>
            <div className="u-stack u-gap-sm">
              <header className="u-stack u-gap-sm">
                <h1 className="u-heading-display">
                  We couldn&apos;t load this post
                </h1>
                <p className="u-text-lead">Please try again later.</p>
              </header>

              <p className="u-text-sm u-text-muted">
                Something went wrong while loading the article. Our team has been
                notified.
              </p>
            </div>
          </MotionFade>
        </article>
      </PageShell>
    );
  }

  const resolvedPost = post!;

  if (resolvedPost.slug !== slug) {
    redirect(`/writing/${resolvedPost.slug}`);
  }

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <article className="u-stack u-gap-2xl u-max-w-lg u-center">
        <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
          <Link className="u-inline-flex u-items-center u-gap-xs" href="/writing">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Back to all writing</span>
          </Link>
        </nav>

        <MotionFade>
          <header className="u-stack u-gap-sm">
            <time className="u-text-uppercase u-text-xs u-text-muted">
              {format(new Date(resolvedPost.date), "MMMM d, yyyy")}
            </time>
            <h1 className="u-heading-display">{resolvedPost.title}</h1>
            <p className="u-text-lead">{resolvedPost.description}</p>
            {resolvedPost.tags?.length ? (
              <ul className="tag-list">
                {resolvedPost.tags.map((tag) => (
                  <li key={tag} className="tag-list__item">
                    {formatTagLabel(tag)}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>
        </MotionFade>

        <div className="prose">{resolvedPost.content}</div>

        <MotionFade delay={0.05}>
          <section
            className="u-stack u-gap-md"
            aria-labelledby="comments-heading"
          >
            <h2 id="comments-heading" className="heading-subtitle">
              Join the discussion
            </h2>
            <CommentProvider slug={resolvedPost.slug}>
              <CommentForm slug={resolvedPost.slug} />
              <Suspense fallback={null}>
                <CommentList slug={resolvedPost.slug} />
              </Suspense>
            </CommentProvider>
          </section>
        </MotionFade>

        {relatedPosts.length > 0 ? (
          <MotionFade delay={0.1}>
            <aside
              className={clsx(
                elevatedSurfaceStyles.elevatedSurface,
                "u-pad-xl u-stack u-gap-sm",
              )}
            >
              <h2 className="heading-subtitle u-text-muted">Keep reading</h2>
              <ul className="u-stack u-gap-sm">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <Link
                      className="u-stack u-gap-2xs"
                      href={`/writing/${related.slug}`}
                    >
                      <span className="u-font-semibold">{related.title}</span>
                      <span className="u-text-muted u-text-sm">
                        {format(new Date(related.date), "MMMM d, yyyy")} ·{" "}
                        {related.description}
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
