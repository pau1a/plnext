import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WRITING_DIR = path.join(CONTENT_DIR, "writing");

export interface EssayFrontMatter {
  title: string;
  slug?: string;
  date: string;
  summary?: string;
  featured?: boolean;
  draft?: boolean;
}

export interface EssaySummary extends EssayFrontMatter {
  slug: string;
}

interface EssaySource {
  file: string;
  slug: string;
  frontMatter: EssaySummary;
}

function shouldIncludeDrafts() {
  return process.env.NODE_ENV !== "production";
}

async function readDirectory(dir: string) {
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => file.endsWith(".mdx"));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function normaliseSlug(candidate: unknown, fallback: string) {
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return fallback.replace(/\.mdx$/, "");
}

async function readEssaySource(file: string): Promise<EssaySource> {
  const fullPath = path.join(WRITING_DIR, file);
  const raw = await fs.readFile(fullPath, "utf8");
  const { data } = matter(raw);

  const { slug: providedSlug, ...rest } = data as EssayFrontMatter;
  const slug = normaliseSlug(providedSlug, file);
  const frontMatter = { slug, ...rest } as EssaySummary;

  return {
    file,
    slug,
    frontMatter,
  };
}

async function loadEssaySources(): Promise<EssaySource[]> {
  const files = await readDirectory(WRITING_DIR);
  return Promise.all(files.map((file) => readEssaySource(file)));
}

function sortByDateDesc(a: EssaySummary, b: EssaySummary) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function getEssays(): Promise<EssaySummary[]> {
  const includeDrafts = shouldIncludeDrafts();
  const sources = await loadEssaySources();

  return sources
    .map((source) => source.frontMatter)
    .filter((essay) => includeDrafts || !essay.draft)
    .sort(sortByDateDesc);
}
