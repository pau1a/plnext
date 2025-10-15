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
    <article className="mx-auto" style={{ maxWidth: "760px" }}>
      <nav aria-label="Breadcrumb" className="mb-4 small text-uppercase">
        <Link className="text-decoration-none text-muted" href="/blog">
          ← Back to all posts
        </Link>
      </nav>

      <header className="mb-5">
        <time className="text-uppercase text-muted small mb-2 d-block">
          {format(new Date(post.date), "MMMM d, yyyy")}
        </time>
        <h1 className="display-5 mb-3">{post.title}</h1>
        <p className="lead text-muted">{post.description}</p>
        {post.tags?.length ? (
          <ul className="list-inline small text-muted mb-0">
            {post.tags.map((tag) => (
              <li key={tag} className="list-inline-item badge rounded-pill text-bg-dark me-1">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="prose mb-5">{post.content}</div>

      {relatedPosts.length > 0 ? (
        <aside className="border-top pt-4">
          <h2 className="h5 mb-3">Keep reading</h2>
          <ul className="list-unstyled">
            {relatedPosts.map((related) => (
              <li key={related.slug} className="mb-3">
                <Link className="text-decoration-none" href={`/blog/${related.slug}`}>
                  <span className="fw-semibold d-block">{related.title}</span>
                  <span className="text-muted small">
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
