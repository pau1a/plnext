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
    <section className="py-4">
      <header className="mb-5 text-center">
        <h1 className="display-5 mb-3">Insights &amp; Updates</h1>
        <p className="lead text-muted">
          Notes from the field on cybersecurity, AI, and practical engineering.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-muted">New writing is on the way.</p>
      ) : (
        <div className="row g-4">
          {posts.map((post) => (
            <article key={post.slug} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <time className="text-uppercase text-muted small mb-2">
                    {format(new Date(post.date), "MMMM d, yyyy")}
                  </time>
                  <h2 className="h4">
                    <Link className="stretched-link text-decoration-none" href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted flex-grow-1">{post.description}</p>
                  <span className="fw-semibold">
                    Read article <i className="fa-solid fa-arrow-right ms-1" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
