import fs from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { resolveTagSlugs } from "./tags";

import { mdxComponents } from "./mdx-components";

const CONTENT_DIR = path.join(process.cwd(), "content");
const NOTES_DIR = path.join(CONTENT_DIR, "notes");

export interface NoteFrontMatter {
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
  slug?: string;
}

export type NoteSummary = Omit<NoteFrontMatter, "slug"> & {
  slug: string;
  fileSlug: string;
};

export interface Note extends NoteSummary {
  content: ReactNode;
  body: string;
}

interface NoteSource {
  file: string;
  slug: string;
  frontMatter: NoteSummary;
  body: string;
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

async function readNoteSource(file: string): Promise<NoteSource> {
  const fullPath = path.join(NOTES_DIR, file);
  const raw = await fs.readFile(fullPath, "utf8");
  const { data, content } = matter(raw);
  const { slug: providedSlug, ...rest } = data as NoteFrontMatter;
  const fileSlug = file.replace(/\.mdx$/, "");
  const slug = normaliseSlug(providedSlug, file);
  const { tags, ...restFrontMatter } = rest;
  const { tags: resolvedTags } = resolveTagSlugs(Array.isArray(tags) ? tags : []);
  const frontMatter = { slug, fileSlug, ...restFrontMatter, tags: resolvedTags } as NoteSummary;

  return {
    file,
    slug,
    frontMatter,
    body: content,
  };
}

async function loadNoteSources(): Promise<NoteSource[]> {
  const files = await readDirectory(NOTES_DIR);
  return Promise.all(files.map((file) => readNoteSource(file)));
}

function sortByDateDesc(a: NoteSummary, b: NoteSummary) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

interface GetNotesOptions {
  includeDrafts?: boolean;
}

export async function getNotes(options: GetNotesOptions = {}): Promise<NoteSummary[]> {
  const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
  const sources = await loadNoteSources();

  return sources
    .map((source) => source.frontMatter)
    .filter((note) => includeDrafts || !note.draft)
    .sort(sortByDateDesc);
}

export async function getNoteSlugs() {
  const includeDrafts = shouldIncludeDrafts();
  const sources = await loadNoteSources();

  return sources
    .filter((source) => includeDrafts || !source.frontMatter.draft)
    .map((source) => ({ slug: source.slug }));
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const includeDrafts = shouldIncludeDrafts();
  const sources = await loadNoteSources();
  const match = sources.find((source) => source.slug === slug || source.frontMatter.fileSlug === slug);

  if (!match) {
    return null;
  }

  if (!includeDrafts && match.frontMatter.draft) {
    return null;
  }

  const { content } = await compileMDX<{ title: string }>({
    source: match.body,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      },
    },
  });

  return {
    ...match.frontMatter,
    tags: resolveTagSlugs(match.frontMatter.tags ?? []).tags,
    content,
    body: match.body,
  } satisfies Note;
}

export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/#{1,6}\s*(.*)/g, "$1")
    .replace(/>\s?/g, "")
    .replace(/\!\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
