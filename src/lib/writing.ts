import fs from "node:fs/promises";
import path from "node:path";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type { SerializeOptions } from "next-mdx-remote/dist/types";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "./mdx-components";

import { ensureSlug } from "./slugify";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WRITING_DIR = path.join(CONTENT_DIR, "writing");

const essayMdxOptions: NonNullable<SerializeOptions["mdxOptions"]> = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
};

interface CompileEssayOptions {
  components?: MDXRemoteProps["components"];
  parseFrontmatter?: boolean;
}

async function compileEssayMdx<TFrontmatter = EssayFrontMatter>(
  source: string,
  { components = mdxComponents, parseFrontmatter = false }: CompileEssayOptions = {},
) {
  return compileMDX<TFrontmatter>({
    source,
    components,
    options: {
      parseFrontmatter,
      mdxOptions: essayMdxOptions,
    },
  });
}

export async function renderEssayBody(source: string) {
  const { content } = await compileEssayMdx(source);
  return content;
}

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
  fileSlug: string;
  body: string;
}

export interface EssayDocument extends EssaySummary {
  content: ReactNode;
}

interface EssaySource {
  file: string;
  slug: string;
  frontMatter: EssaySummary;
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
  const fallbackBase = fallback.replace(/\.mdx$/, "");
  return ensureSlug(typeof candidate === "string" ? candidate : undefined, fallbackBase);
}

async function readEssaySource(file: string): Promise<EssaySource> {
  const fullPath = path.join(WRITING_DIR, file);
  const raw = await fs.readFile(fullPath, "utf8");
  const { data, content: body } = matter(raw);

  const { slug: providedSlug, ...rest } = data as EssayFrontMatter;
  const slug = normaliseSlug(providedSlug, file);
  const fileSlug = file.replace(/\.mdx$/, "");
  const frontMatter = { slug, fileSlug, body, ...rest } as EssaySummary;

  return {
    file,
    slug,
    frontMatter,
    body,
  };
}

async function loadEssaySources(): Promise<EssaySource[]> {
  const files = await readDirectory(WRITING_DIR);
  return Promise.all(files.map((file) => readEssaySource(file)));
}

function sortByDateDesc(a: EssaySummary, b: EssaySummary) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

interface GetEssaysOptions {
  includeDrafts?: boolean;
}

export async function getEssays(options: GetEssaysOptions = {}): Promise<EssaySummary[]> {
  const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
  const sources = await loadEssaySources();

  return sources
    .map((source) => source.frontMatter)
    .filter((essay) => includeDrafts || !essay.draft)
    .sort(sortByDateDesc);
}

interface GetEssayOptions {
  includeDrafts?: boolean;
}

export async function getEssay(slug: string, options: GetEssayOptions = {}): Promise<EssayDocument | null> {
  const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
  const safeSlug = normaliseSlug(slug, slug);
  const sources = await loadEssaySources();

  const matchByFrontmatter = sources.find((source) => source.frontMatter.slug === safeSlug);
  const matchByFile = sources.find((source) => source.file.replace(/\.mdx$/, "") === safeSlug);
  const target = matchByFrontmatter ?? matchByFile;

  if (!target) {
    return null;
  }

  if (target.frontMatter.draft && !includeDrafts) {
    return null;
  }

  const fullPath = path.join(WRITING_DIR, target.file);
  const raw = await fs.readFile(fullPath, "utf8");

  const { content, frontmatter } = await compileEssayMdx<EssayFrontMatter>(raw, {
    parseFrontmatter: true,
  });

  if (frontmatter.draft && !includeDrafts) {
    return null;
  }

  const canonicalSlug = normaliseSlug(frontmatter.slug, target.frontMatter.slug ?? target.frontMatter.fileSlug ?? safeSlug);

  const summary: EssaySummary = {
    slug: canonicalSlug,
    fileSlug: target.frontMatter.fileSlug ?? target.file.replace(/\.mdx$/, ""),
    body: target.body,
    title: frontmatter.title ?? target.frontMatter.title ?? canonicalSlug,
    date: frontmatter.date ?? target.frontMatter.date ?? new Date().toISOString(),
    summary: frontmatter.summary ?? target.frontMatter.summary,
    featured: frontmatter.featured ?? target.frontMatter.featured,
    draft: frontmatter.draft ?? target.frontMatter.draft,
  } satisfies EssaySummary;

  return {
    ...summary,
    content,
  };
}

export async function getEssaySlugs(options: GetEssaysOptions = {}): Promise<string[]> {
  const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
  const sources = await loadEssaySources();
  return sources
    .map((source) => source.frontMatter)
    .filter((essay) => includeDrafts || !essay.draft)
    .map((essay) => essay.slug);
}

/**
 * Get essay content for RSS feeds with plain HTML components
 */
export async function getEssayForRSS(slug: string): Promise<EssayDocument | null> {
  const React = await import("react");

  const safeSlug = normaliseSlug(slug, slug);
  const sources = await loadEssaySources();

  const matchByFrontmatter = sources.find((source) => source.frontMatter.slug === safeSlug);
  const matchByFile = sources.find((source) => source.file.replace(/\.mdx$/, "") === safeSlug);
  const target = matchByFrontmatter ?? matchByFile;

  if (!target || target.frontMatter.draft) {
    return null;
  }

  const fullPath = path.join(WRITING_DIR, target.file);
  const raw = await fs.readFile(fullPath, "utf8");

  // RSS-safe components
  const rssComponents = {
    img: (props: RSSMediaProps) => {
      const { title, alt = "", ...rest } = props;
      return React.createElement(
        "figure",
        null,
        React.createElement("img", { alt, ...(rest as ImgHTMLAttributes<HTMLImageElement>) }),
        title && React.createElement("figcaption", null, title)
      );
    },
    ContentImage: (props: RSSMediaProps) => {
      const { caption, alt = "", title, ...rest } = props;
      const captionText = caption || title;
      return React.createElement(
        "figure",
        null,
        React.createElement("img", { alt, ...(rest as ImgHTMLAttributes<HTMLImageElement>) }),
        captionText && React.createElement("figcaption", null, captionText)
      );
    },
  };

  const { content, frontmatter } = await compileEssayMdx<EssayFrontMatter>(raw, {
    components: rssComponents,
    parseFrontmatter: true,
  });

  if (frontmatter.draft) {
    return null;
  }

  const canonicalSlug = normaliseSlug(frontmatter.slug, target.frontMatter.slug ?? target.frontMatter.fileSlug ?? safeSlug);

  return {
    slug: canonicalSlug,
    fileSlug: target.frontMatter.fileSlug ?? target.file.replace(/\.mdx$/, ""),
    title: frontmatter.title ?? target.frontMatter.title ?? canonicalSlug,
    date: frontmatter.date ?? target.frontMatter.date ?? new Date().toISOString(),
    summary: frontmatter.summary ?? target.frontMatter.summary,
    featured: frontmatter.featured ?? target.frontMatter.featured,
    draft: frontmatter.draft ?? target.frontMatter.draft,
    body: target.body,
    content,
  };
}
type RSSMediaProps = Record<string, unknown> & {
  alt?: string;
  title?: string;
  caption?: string;
};
