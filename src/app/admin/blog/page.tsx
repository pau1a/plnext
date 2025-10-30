import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { formatDate } from "@/lib/date";
import { getBlogPostSummaries } from "@/lib/mdx";
import { formatTagLabel } from "@/lib/tags";

import styles from "./blog.module.scss";

export const metadata: Metadata = {
  title: "Blog posts",
};

export default async function AdminBlogPage() {
  const actor = await requirePermission("audit:read");
  const posts = await getBlogPostSummaries({ includeDrafts: true });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Blog management">
        <div className="u-flex u-justify-between u-items-center u-gap-sm u-flex-wrap" style={{ marginBottom: "1rem" }}>
          <p className="u-text-muted u-text-sm">
            Manage your blog posts. Add `.mdx` files under <code>content/blog</code> or create new posts below.
          </p>
          <Link className="button button--sm" href="/admin/blog/new">
            + New Blog Post
          </Link>
        </div>
        <section aria-label="Blog post inventory" className={styles.grid}>
          {posts.length === 0 ? (
            <p className="u-text-muted">No blog posts found. Add `.mdx` files under `content/blog` to populate this list.</p>
          ) : (
            posts.map((post) => (
              <article className={styles.row} key={post.fileSlug}>
                <div className={styles.primary}>
                  <div className={styles.meta}>
                    <span className={styles.date}>{formatDate(post.date)}</span>
                    <span aria-hidden="true">•</span>
                    <span className={styles.slug}>/{post.slug}</span>
                    {post.draft ? (
                      <span className={styles.commentBadge} style={{ backgroundColor: "var(--admin-status-warning)" }}>Draft</span>
                    ) : null}
                    {post.comments?.length ? (
                      <span className={styles.commentBadge}>{post.comments.length} curated comments</span>
                    ) : null}
                  </div>

                  <div className={styles.heading}>
                    <h2 className={styles.title}>{post.title}</h2>
                    {post.tags && post.tags.length > 0 ? (
                      <div className={styles.tags}>
                        {post.tags.map((tag) => (
                          <span className={styles.tag} key={tag}>
                            {formatTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <p className={styles.summary}>{post.description}</p>
                </div>

                <div className={styles.actions}>
                  <Link className="button button--ghost button--xs" href={`/writing/${post.slug}`}>
                    View
                  </Link>
                  <Link className="button button--ghost button--xs" href={`/admin/blog/${post.fileSlug}`}>
                    Edit
                  </Link>
                  <button className="button button--ghost button--xs" type="button" disabled>
                    Schedule
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
