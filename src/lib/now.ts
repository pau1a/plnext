import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

type NowMeta = {
  title?: string;
  updated?: string;
  summary?: string;
  [key: string]: unknown;
};

export async function getNow(): Promise<{ meta: NowMeta; content: string }> {
  const filePath = path.join(process.cwd(), "content", "now", "index.mdx");
  const file = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(file);

  return { meta: data as NowMeta, content };
}
