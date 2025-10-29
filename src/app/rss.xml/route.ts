import { getBlogPostForRSS, getProjectForRSS } from "@/lib/mdx";
import { getEssayForRSS } from "@/lib/writing";
import { getNoteForRSS } from "@/lib/notes";
import { loadStreamForRSS } from "@/lib/stream";
import { getBlogIndexPage } from "@/lib/supabase/blog";
import { getProjectSummaries } from "@/lib/mdx";
import { getEssays } from "@/lib/writing";
import { getNotes } from "@/lib/notes";
import type { ReactElement } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

export const revalidate = 1800;

type RSSItem = {
  type: "blog" | "project" | "essay" | "note" | "stream";
  slug: string;
  title: string;
  link: string;
  date: string;
  description: string;
};

export async function GET() {
  try {
    // Fetch all content types
    const [blogPage, projects, essays, notes, stream] = await Promise.all([
      getBlogIndexPage({ pageSize: 50 }),
      getProjectSummaries({ includeDrafts: false }),
      getEssays({ includeDrafts: false }),
      getNotes({ includeDrafts: false }),
      loadStreamForRSS(),
    ]);

    // Convert all content to unified RSS items
    const allItems: RSSItem[] = [
      // Blog posts
      ...blogPage.items.map((post) => ({
        type: "blog" as const,
        slug: post.slug,
        title: post.title,
        link: `${siteUrl}/writing/${post.slug}`,
        date: post.date,
        description: post.description,
      })),
      // Projects
      ...projects.map((project) => ({
        type: "project" as const,
        slug: project.slug,
        title: project.title,
        link: `${siteUrl}/projects/${project.slug}`,
        date: project.date,
        description: project.summary,
      })),
      // Essays
      ...essays.map((essay) => ({
        type: "essay" as const,
        slug: essay.slug,
        title: essay.title,
        link: `${siteUrl}/essays/${essay.slug}`,
        date: essay.date,
        description: essay.summary ?? "",
      })),
      // Notes
      ...notes.map((note) => ({
        type: "note" as const,
        slug: note.slug,
        title: note.title,
        link: `${siteUrl}/notes/${note.slug}`,
        date: note.date,
        description: note.summary ?? "",
      })),
      // Stream
      ...stream.map((entry) => ({
        type: "stream" as const,
        slug: entry.id,
        title: `Stream update: ${entry.timestamp}`,
        link: `${siteUrl}/stream#${entry.id}`,
        date: entry.timestamp,
        description: entry.body.substring(0, 200),
      })),
    ];

    // Sort by date descending
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const { renderToStaticMarkup } = await import("react-dom/server");

    // Render each item with full content
    const items = await Promise.all(
      allItems.map(async (item) => {
        let content = "";

        try {
          if (item.type === "blog") {
            const fullPost = await getBlogPostForRSS(item.slug);
            if (fullPost?.content) {
              content = renderToStaticMarkup(fullPost.content as ReactElement);
            }
          } else if (item.type === "project") {
            const fullProject = await getProjectForRSS(item.slug);
            if (fullProject?.content) {
              content = renderToStaticMarkup(fullProject.content as ReactElement);
            }
          } else if (item.type === "essay") {
            const fullEssay = await getEssayForRSS(item.slug);
            if (fullEssay?.content) {
              content = renderToStaticMarkup(fullEssay.content as ReactElement);
            }
          } else if (item.type === "note") {
            const fullNote = await getNoteForRSS(item.slug);
            if (fullNote?.content) {
              content = renderToStaticMarkup(fullNote.content as ReactElement);
            }
          } else if (item.type === "stream") {
            const streamEntry = stream.find((s) => s.id === item.slug);
            if (streamEntry?.content) {
              content = renderToStaticMarkup(streamEntry.content as ReactElement);
            }
          }
        } catch (error) {
          console.error(`Failed to render content for ${item.type} ${item.slug}:`, error);
          // Fall back to using the description
          content = "";
        }

        return `
        <item>
          <title><![CDATA[${item.title}]]></title>
          <link>${item.link}</link>
          <guid isPermaLink="true">${item.link}</guid>
          <pubDate>${new Date(item.date).toUTCString()}</pubDate>
          <description><![CDATA[${item.description}]]></description>
          <content:encoded><![CDATA[${content}]]></content:encoded>
        </item>
      `;
      }),
    );

    const latestDate = allItems.length > 0 ? new Date(allItems[0].date) : new Date();

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Paula Livingstone</title>
        <link>${siteUrl}</link>
        <atom:link rel="self" href="${siteUrl}/rss.xml" type="application/rss+xml" />
        <description>Cybersecurity, AI, and engineering notes from Paula Livingstone.</description>
        <language>en-gb</language>
        <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
        ${items.join("\n")}
      </channel>
    </rss>`;

    return new Response(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": `s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
      },
    });
  } catch (error) {
    console.error("Failed to generate RSS feed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
