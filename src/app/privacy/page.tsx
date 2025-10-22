import { MDXRemote } from "next-mdx-remote/rsc";

import { getPrivacy } from "@/lib/privacy";

import styles from "./privacy.module.scss";

export const metadata = {
  title: "Privacy | Paula Livingstone",
  description: "How this site handles data, cookies, and third parties.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-static";

export default async function PrivacyPage() {
  const { meta, content } = await getPrivacy();

  const updatedDate = meta?.updated
    ? new Date(meta.updated).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">
          {meta?.title ?? "Privacy Policy"}
        </h1>
        {updatedDate ? (
          <time className="mt-1 block text-sm text-muted" dateTime={String(meta.updated)}>
            Updated {updatedDate}
          </time>
        ) : null}
        {meta?.summary ? <p className="mt-2 text-muted">{meta.summary}</p> : null}
      </header>

      <div className={`prose dark:prose-invert ${styles.content}`}>
        <MDXRemote source={content} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PrivacyPolicy",
            name: "Privacy Policy",
            url: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/privacy`
              : "/privacy",
            dateModified: meta?.updated || undefined,
          }),
        }}
      />
    </article>
  );
}
