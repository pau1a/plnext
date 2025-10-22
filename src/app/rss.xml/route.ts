import { getBlogPost } from "@/lib/mdx";
import {
  BLOG_AFTER_PARAM,
  BLOG_BEFORE_PARAM,
  BLOG_INDEX_REVALIDATE_SECONDS,
  BlogCursorError,
  createCursorHref,
  getBlogIndexPage,
  parseCursorParam,
} from "@/lib/supabase/blog";
import type { ReactElement } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

const RSS_PAGE_SIZE = 12;

export const revalidate = BLOG_INDEX_REVALIDATE_SECONDS;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const after = parseCursorParam(url.searchParams.get(BLOG_AFTER_PARAM) ?? undefined);
  const before = parseCursorParam(url.searchParams.get(BLOG_BEFORE_PARAM) ?? undefined);

  let page;
  try {
    page = await getBlogIndexPage({ pageSize: RSS_PAGE_SIZE, after, before });
  } catch (error) {
    if (error instanceof BlogCursorError) {
      return new Response("Invalid cursor", { status: 400 });
    }

    console.error("Failed to render RSS feed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  const posts = page.items;

  const { renderToStaticMarkup } = await import("react-dom/server");

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
  const navLinks = [
    page.prevCursor
      ? `<atom:link rel="prev" href="${createCursorHref(`${siteUrl}/rss.xml`, BLOG_BEFORE_PARAM, page.prevCursor)}" type="application/rss+xml" />`
      : null,
    page.nextCursor
      ? `<atom:link rel="next" href="${createCursorHref(`${siteUrl}/rss.xml`, BLOG_AFTER_PARAM, page.nextCursor)}" type="application/rss+xml" />`
      : null,
  ]
    .filter(Boolean)
    .join("\n        ");

  const currentParams = new URLSearchParams();
  if (after) {
    currentParams.set(BLOG_AFTER_PARAM, after);
  }
  if (before) {
    currentParams.set(BLOG_BEFORE_PARAM, before);
  }
  const currentFeedUrl = currentParams.size
    ? `${siteUrl}/rss.xml?${currentParams.toString()}`
    : `${siteUrl}/rss.xml`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Paula Livingstone</title>
        <link>${siteUrl}</link>
        <atom:link rel="self" href="${currentFeedUrl}" type="application/rss+xml" />
        ${navLinks}
        <description>Cybersecurity, AI, and engineering notes from Paula Livingstone.</description>
        <language>en-gb</language>
        <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
        ${items.join("\n")}
      </channel>
    </rss>`;

  const cacheControl = `s-maxage=${BLOG_INDEX_REVALIDATE_SECONDS}, stale-while-revalidate=${BLOG_INDEX_REVALIDATE_SECONDS}`;

  try {
    console.info(
      JSON.stringify({
        event: "rss-cache-hint",
        revalidate: BLOG_INDEX_REVALIDATE_SECONDS,
        cacheControl,
        cursor: { after, before },
        itemCount: posts.length,
      }),
    );
  } catch (error) {
    console.error("Failed to emit RSS cache hint:", error);
  }

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
