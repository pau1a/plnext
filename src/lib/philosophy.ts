import fs from "fs/promises";
import matter from "gray-matter";

export async function getPhilosophy() {
  const file = await fs.readFile("content/philosophy/index.mdx", "utf8");
  const { data, content } = matter(file);
  return { meta: data as Record<string, unknown>, content };
}
