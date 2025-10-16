import { PostCard } from "@/components/post-card";
import cardStyles from "@/components/card.module.scss";
import { getBlogPostSummaries } from "@/lib/mdx";
import type { Metadata } from "next";

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
        <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridBlog}`}>
          {posts.map((post) => (
            <PostCard key={post.slug} summary={post} />
          ))}
        </div>
      )}
    </section>
  );
}
