import { getBlogPostSummaries } from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Updates on cybersecurity, AI operations, and the engineering work behind them.",
};

export default async function BlogPage() {
  const posts = await getBlogPostSummaries();

  return (
    <section className="u-stack u-gap-2xl">
      <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
        <h1 className="heading-display-lg">Insights &amp; Updates</h1>
        <p className="u-text-lead u-center u-max-w-md">
          Notes from the field on cybersecurity, AI, and practical engineering.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="u-text-center u-text-muted">New writing is on the way.</p>
      ) : (
        <div className="layout-grid layout-grid--three">
          {posts.map((post) => (
            <article key={post.slug} className="surface surface--interactive">
              <Link className="surface__link" href={`/blog/${post.slug}`}>
                <time className="u-text-uppercase u-text-xs u-text-muted">
                  {format(new Date(post.date), "MMMM d, yyyy")}
                </time>
                <h2 className="heading-section">{post.title}</h2>
                <p className="u-text-muted u-flex-grow-1">{post.description}</p>
                <span className="u-inline-flex u-items-center u-gap-xs u-font-semibold">
                  Read article <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
