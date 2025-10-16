import { CommentList } from "@/components/comment-list";
import { getBlogPost, getBlogPostSummaries, getBlogSlugs } from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getBlogSlugs();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const publishedAt = new Date(post.date).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      publishedTime: publishedAt,
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await getBlogPostSummaries()).filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <article className="u-stack u-gap-2xl u-max-w-lg u-center">
      <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
        <Link className="u-inline-flex u-items-center u-gap-xs" href="/blog">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back to all posts</span>
        </Link>
      </nav>

      <header className="u-stack u-gap-sm">
        <time className="u-text-uppercase u-text-xs u-text-muted">
          {format(new Date(post.date), "MMMM d, yyyy")}
        </time>
        <h1 className="heading-display-lg">{post.title}</h1>
        <p className="u-text-lead">{post.description}</p>
        {post.tags?.length ? (
          <ul className="tag-list">
            {post.tags.map((tag) => (
              <li key={tag} className="tag-list__item">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="prose u-stack u-gap-lg">{post.content}</div>

      {post.comments?.length ? (
        <section className="u-stack u-gap-sm" aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="heading-subtitle">
            Reader comments
          </h2>
          <CommentList comments={post.comments} />
        </section>
      ) : null}

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
  );
}
