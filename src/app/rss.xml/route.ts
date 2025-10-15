import { getBlogPost, getBlogPostSummaries } from "@/lib/mdx";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

export const revalidate = 3600;

export async function GET() {
  const posts = await getBlogPostSummaries();

  const items = await Promise.all(
    posts.map(async (post) => {
      const fullPost = await getBlogPost(post.slug);
      const content = fullPost
        ? renderToStaticMarkup(fullPost.content as ReactElement)
        : "";

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${siteUrl}/blog/${post.slug}</link>
          <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <description><![CDATA[${post.description}]]></description>
          <content:encoded><![CDATA[${content}]]></content:encoded>
        </item>
      `;
    }),
  );

  const latestPostDate = posts.length > 0 ? new Date(posts[0].date) : new Date();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>Paula Livingstone</title>
        <link>${siteUrl}</link>
        <description>Cybersecurity, AI, and engineering notes from Paula Livingstone.</description>
        <language>en-gb</language>
        <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
        ${items.join("\n")}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
