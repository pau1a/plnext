import { Suspense } from "react";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";
import { getBlogPost, getBlogPostSummaries, getBlogSlugs } from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostPageParams {
  slug: string;
}

type BlogPostPageParamsInput = BlogPostPageParams | Promise<BlogPostPageParams>;

interface BlogPostPageProps {
  params: BlogPostPageParamsInput;
}

async function resolveParams(params: BlogPostPageParamsInput): Promise<BlogPostPageParams> {
  if (typeof (params as Promise<BlogPostPageParams>).then === "function") {
    return params as Promise<BlogPostPageParams>;
  }

  return params as BlogPostPageParams;
}

export async function generateStaticParams() {
  return getBlogSlugs();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const publishedAt = new Date(post.date).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";
  const canonicalPath = `/blog/${post.slug}`;

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
    const resolvedError = error instanceof Error ? error : new Error(String(error));
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
    relatedPosts = summaries.filter((item) => item.slug !== post?.slug).slice(0, 3);
  } catch (error) {
    const resolvedError = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to load related posts:", resolvedError);
    relatedPosts = [];
  }

  if (postError) {
    return (
      <div className="l-container motion-fade-in u-pad-block-3xl">
        <article className="u-stack u-gap-2xl u-max-w-lg u-center">
          <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
            <Link className="u-inline-flex u-items-center u-gap-xs" href="/blog">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              <span>Back to all posts</span>
            </Link>
          </nav>

          <header className="u-stack u-gap-sm">
            <h1 className="heading-display-lg">We couldn&apos;t load this post</h1>
            <p className="u-text-lead">Please try again later.</p>
          </header>

          <p className="u-text-sm u-text-muted">
            Something went wrong while loading the article. Our team has been notified.
          </p>
        </article>
      </div>
    );
  }

  const resolvedPost = post!;

  return (
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <article className="u-stack u-gap-2xl u-max-w-lg u-center">
        <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
          <Link className="u-inline-flex u-items-center u-gap-xs" href="/blog">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Back to all posts</span>
          </Link>
        </nav>

        <header className="u-stack u-gap-sm">
          <time className="u-text-uppercase u-text-xs u-text-muted">
            {format(new Date(resolvedPost.date), "MMMM d, yyyy")}
          </time>
          <h1 className="heading-display-lg">{resolvedPost.title}</h1>
          <p className="u-text-lead">{resolvedPost.description}</p>
          {resolvedPost.tags?.length ? (
            <ul className="tag-list">
              {resolvedPost.tags.map((tag) => (
                <li key={tag} className="tag-list__item">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="prose u-stack u-gap-lg">{resolvedPost.content}</div>

        <section className="u-stack u-gap-md" aria-labelledby="comments-heading">
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

        {relatedPosts.length > 0 ? (
          <aside className="surface u-pad-xl u-stack u-gap-sm">
            <h2 className="heading-subtitle u-text-muted">Keep reading</h2>
            <ul className="u-stack u-gap-sm">
              {relatedPosts.map((related) => (
                <li key={related.slug}>
                  <Link className="u-stack u-gap-2xs" href={`/blog/${related.slug}`}>
                    <span className="u-font-semibold">{related.title}</span>
                    <span className="u-text-muted u-text-sm">
                      {format(new Date(related.date), "MMMM d, yyyy")} · {related.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </article>
    </div>
  );
}
