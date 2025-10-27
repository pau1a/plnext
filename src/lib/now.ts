import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { parseJSONL } from "./stream";

type NowMeta = {
  title?: string;
  updated?: string;
  summary?: string;
  [key: string]: unknown;
};

export type NowSource =
  | { type: "stream"; meta: NowMeta; content: string }
  | { type: "mdx"; meta: NowMeta; content: string };

export async function getNow(): Promise<NowSource> {
  // First check if there's a stream entry marked as "Now"
  const streamFile = path.join(process.cwd(), "content", "stream", "stream.jsonl");
  try {
    const records = await parseJSONL(streamFile);
    const nowEntry = records.find((record) => record.isNow === true);

    if (nowEntry) {
      return {
        type: "stream",
        meta: {
          title: "Now",
          updated: nowEntry.timestamp,
        },
        content: nowEntry.body,
      };
    }
  } catch {
    // If stream file doesn't exist or fails to parse, fall back to MDX
  }

  // Fallback to MDX file
  const filePath = path.join(process.cwd(), "content", "now", "index.mdx");
  const file = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(file);

  return { type: "mdx", meta: data as NowMeta, content };
}
