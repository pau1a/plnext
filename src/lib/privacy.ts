import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

type PrivacyMeta = {
  title?: string;
  updated?: string;
  summary?: string;
  [key: string]: unknown;
};

export async function getPrivacy(): Promise<{ meta: PrivacyMeta; content: string }> {
  const filePath = path.join(process.cwd(), "content", "privacy", "index.mdx");
  const file = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(file);

  return { meta: data as PrivacyMeta, content };
}
