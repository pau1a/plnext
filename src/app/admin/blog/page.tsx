import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { formatDate } from "@/lib/date";
import { getBlogPostSummaries } from "@/lib/mdx";

import styles from "./blog.module.scss";

export const metadata: Metadata = {
  title: "Blog posts",
};

export default async function AdminBlogPage() {
  const actor = await requirePermission("audit:read");
  const posts = await getBlogPostSummaries();

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Blog management">
        <section aria-label="Blog post inventory" className={styles.grid}>
          {posts.length === 0 ? (
            <p className="u-text-muted">No blog posts found. Add `.mdx` files under `content/blog` to populate this list.</p>
          ) : (
            posts.map((post) => (
              <article className={styles.card} key={post.slug}>
                <header className="u-stack u-gap-xs">
                  <div className={styles.meta}>
                    <span>{formatDate(post.date)}</span>
                    <span aria-hidden="true">•</span>
                    <span>/{post.slug}</span>
                  </div>
                  <h2 className="u-heading-md u-font-semibold">{post.title}</h2>
                  <p className="u-text-muted u-text-sm">{post.description}</p>
                  {post.tags && post.tags.length > 0 ? (
                    <div className={styles.tags}>
                      {post.tags.map((tag) => (
                        <span className={styles.tag} key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {post.comments?.length ? (
                    <p className={styles.comments}>{post.comments.length} curated comments</p>
                  ) : null}
                </header>

                <div className={styles.actions}>
                  <Link className="button button--ghost button--sm" href={`/writing/${post.slug}`}>
                    View live post
                  </Link>
                  <button className="button button--ghost button--sm" type="button" disabled>
                    Edit content (coming soon)
                  </button>
                  <button className="button button--ghost button--sm" type="button" disabled>
                    Schedule publish
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </AdminShell>
    </PageShell>
  );
}
