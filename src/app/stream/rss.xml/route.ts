import { renderToStaticMarkup } from "react-dom/server";

import { stripMarkdown } from "@/lib/notes";
import { loadStream } from "@/lib/stream";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";
const FEED_URL = `${siteUrl}/stream/rss.xml`;

export const revalidate = 60 * 15;

function createItemTitle(body: string) {
  const plain = stripMarkdown(body).replace(/\[\[(.*?)\]\]/g, "$1");

  if (plain.length <= 80) {
    return plain;
  }

  return `${plain.slice(0, 77)}...`;
}

export async function GET() {
  const entries = await loadStream();

  const items = entries.map((entry) => {
    const content = renderToStaticMarkup(entry.content);
    const title = createItemTitle(entry.body) || `Stream entry ${entry.id}`;
    const published = new Date(entry.timestamp);

    return `
      <item>
        <title><![CDATA[${title}]]></title>
        <link>${siteUrl}/stream#${entry.id}</link>
        <guid isPermaLink="true">${siteUrl}/stream#${entry.id}</guid>
        <pubDate>${published.toUTCString()}</pubDate>
        <description><![CDATA[${content}]]></description>
      </item>
    `;
  });

  const latestDate = entries.length > 0 ? new Date(entries[0].timestamp) : new Date();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Stream | Paula Livingstone</title>
        <link>${siteUrl}/stream</link>
        <description>Short, timestamped notes. Public subset.</description>
        <language>en-gb</language>
        <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
        <atom:link rel="self" href="${FEED_URL}" type="application/rss+xml" />
        ${items.join("\n")}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
    },
  });
}
