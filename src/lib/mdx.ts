import fs from "node:fs/promises";
import path from "node:path";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "./mdx-components";
import { ensureSlug } from "./slugify";
import { resolveTagSlugs } from "./tags";

export interface BlogPostComment {
  author: string;
  role?: string;
  body: string;
  date?: string;
}

export interface BlogPostFrontMatter {
  title: string;
  slug?: string;
  date: string;
  description: string;
  tags?: string[];
  draft?: boolean;
  comments?: BlogPostComment[];
}

export interface ProjectFrontMatter {
  title: string;
  slug?: string;
  date: string;
  summary: string;
  role?: string;
  status?: string;
  stack?: string[];
  draft?: boolean;
}

export interface BlogPostSummary extends BlogPostFrontMatter {
  slug: string;
  fileSlug: string;
  filePath: string;
}

export interface ProjectSummary extends ProjectFrontMatter {
  slug: string;
  fileSlug: string;
}

export interface BlogPost extends BlogPostSummary {
  content: ReactNode;
}

export interface ProjectDocument extends ProjectSummary {
  content: ReactNode;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const WRITING_DIR = path.join(CONTENT_DIR, "writing");
const BLOG_SOURCE_DIRS = [BLOG_DIR, WRITING_DIR];
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");

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

function sortByDateDesc<T extends { date: string }>(a: T, b: T) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

async function readFrontMatter<T extends { draft?: boolean }>(dir: string, file: string) {
  const fullPath = path.join(dir, file);
  const raw = await fs.readFile(fullPath, "utf8");
  const { data } = matter(raw);
  return data as T;
}

function buildBlogCandidatePaths(match: BlogPostSummary | undefined, slug: string): string[] {
  const candidateFileSlugs = Array.from(
    new Set(
      [match?.fileSlug, match?.slug, slug].filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      ),
    ),
  );

  const candidatePaths: string[] = [];

  if (match?.filePath) {
    candidatePaths.push(path.join(CONTENT_DIR, match.filePath));
  }

  for (const fileSlugCandidate of candidateFileSlugs) {
    for (const dir of BLOG_SOURCE_DIRS) {
      const candidate = path.join(dir, `${fileSlugCandidate}.mdx`);
      if (!candidatePaths.includes(candidate)) {
        candidatePaths.push(candidate);
      }
    }
  }

  return candidatePaths;
}

interface GetBlogPostSummariesOptions {
  includeDrafts?: boolean;
}

export async function getBlogPostSummaries(options: GetBlogPostSummariesOptions = {}): Promise<BlogPostSummary[]> {
  const includeDrafts = options.includeDrafts ?? false;
  const filesByDirectory = await Promise.all(
    BLOG_SOURCE_DIRS.map(async (dir) => {
      const files = await readDirectory(dir);
      return files.map((file) => ({ dir, file }));
    }),
  );

  const posts = await Promise.all(
    filesByDirectory.flat().map(async ({ dir, file }) => {
      const fileSlug = file.replace(/\.mdx$/, "");
      const data = await readFrontMatter<BlogPostFrontMatter>(dir, file);
      const { slug: providedSlug, tags, ...rest } = data;
      const slug = ensureSlug(providedSlug, fileSlug);
      const { tags: resolvedTags } = resolveTagSlugs(Array.isArray(tags) ? tags : []);
      const filePath = path.relative(CONTENT_DIR, path.join(dir, file));
      return { fileSlug, slug, filePath, tags: resolvedTags, ...rest } satisfies BlogPostSummary;
    }),
  );

  return posts
    .filter((post) => includeDrafts || !post.draft)
    .sort(sortByDateDesc);
}

interface GetProjectSummariesOptions {
  includeDrafts?: boolean;
}

export async function getProjectSummaries(options: GetProjectSummariesOptions = {}): Promise<ProjectSummary[]> {
  const includeDrafts = options.includeDrafts ?? false;
  const files = await readDirectory(PROJECTS_DIR);

  const projects = await Promise.all(
    files.map(async (file) => {
      const fileSlug = file.replace(/\.mdx$/, "");
      const data = await readFrontMatter<ProjectFrontMatter>(PROJECTS_DIR, file);
      const { slug: providedSlug, ...rest } = data;
      const slug = ensureSlug(providedSlug, fileSlug);
      return { fileSlug, slug, ...rest } satisfies ProjectSummary;
    }),
  );

  return projects
    .filter((project) => includeDrafts || !project.draft)
    .sort(sortByDateDesc);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const summaries = await getBlogPostSummaries();
  const match = summaries.find((post) => post.slug === slug || post.fileSlug === slug);
  const fallbackSlug = match?.slug ?? slug;

  for (const fullPath of buildBlogCandidatePaths(match, slug)) {
    try {
      const source = await fs.readFile(fullPath, "utf8");
      const { content, frontmatter } = await compileMDX<BlogPostFrontMatter>({
        source,
        components: mdxComponents,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
          },
        },
      });

      if (frontmatter.draft) {
        return null;
      }

      const { slug: providedSlug, tags, ...rest } = frontmatter;
      const canonicalSlug = ensureSlug(providedSlug, fallbackSlug);
      const { tags: resolvedTags } = resolveTagSlugs(Array.isArray(tags) ? tags : []);
      const fileSlugCandidate = path.basename(fullPath, ".mdx");
      const filePath = path.relative(CONTENT_DIR, fullPath);

      return {
        slug: canonicalSlug,
        fileSlug: fileSlugCandidate,
        filePath,
        content,
        tags: resolvedTags,
        ...rest,
      } satisfies BlogPost;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }

  return null;
}

export async function getProjectDocument(slug: string): Promise<ProjectDocument | null> {
  const summaries = await getProjectSummaries({ includeDrafts: true });
  const match = summaries.find((project) => project.slug === slug || project.fileSlug === slug);
  const fileSlug = match?.fileSlug ?? slug;
  const fallbackSlug = match?.slug ?? slug;

  const fullPath = path.join(PROJECTS_DIR, `${fileSlug}.mdx`);

  try {
    const source = await fs.readFile(fullPath, "utf8");
    const { content, frontmatter } = await compileMDX<ProjectFrontMatter>({
      source,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        },
      },
    });

    if (frontmatter.draft && !shouldIncludeDrafts()) {
      return null;
    }

    const { slug: providedSlug, ...rest } = frontmatter;
    const canonicalSlug = ensureSlug(providedSlug, fallbackSlug);

    return { slug: canonicalSlug, fileSlug, content, ...rest } satisfies ProjectDocument;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function getBlogSlugs() {
  const summaries = await getBlogPostSummaries();
  return summaries.map((post) => ({ slug: post.slug }));
}

export async function getProjectSlugs() {
  const files = await readDirectory(PROJECTS_DIR);
  return files.map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

export function extractH2H3(src: string) {
  const lines = src.split("\n");
  const items: { id: string; text: string; level: 2 | 3 }[] = [];

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    const h3 = /^###\s+(.+)$/.exec(line);

    if (h2 || h3) {
      const text = (h2?.[1] || h3?.[1] || "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      items.push({ id, text, level: h2 ? 2 : 3 });
    }
  }

  return items;
}

/**
 * RSS-safe components factory - use plain HTML instead of Next.js components
 */
async function createRSSComponents() {
  const React = await import("react");

  return {
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
}

/**
 * Get blog post content for RSS feeds with plain HTML components
 * This version uses simple img tags instead of Next.js Image components
 */
export async function getBlogPostForRSS(slug: string): Promise<{ content: ReactNode; frontmatter: BlogPostFrontMatter } | null> {
  const summaries = await getBlogPostSummaries();
  const match = summaries.find((post) => post.slug === slug || post.fileSlug === slug);
  for (const fullPath of buildBlogCandidatePaths(match, slug)) {
    try {
      const source = await fs.readFile(fullPath, "utf8");
      const rssComponents = await createRSSComponents();

      const { content, frontmatter } = await compileMDX<BlogPostFrontMatter>({
        source,
        components: rssComponents,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
          },
        },
      });

      if (frontmatter.draft) {
        return null;
      }

      return { content, frontmatter };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }

  return null;
}

/**
 * Get project content for RSS feeds with plain HTML components
 */
export async function getProjectForRSS(slug: string): Promise<{ content: ReactNode; frontmatter: ProjectFrontMatter } | null> {
  const summaries = await getProjectSummaries({ includeDrafts: false });
  const match = summaries.find((project) => project.slug === slug || project.fileSlug === slug);
  const fileSlug = match?.fileSlug ?? slug;

  const fullPath = path.join(PROJECTS_DIR, `${fileSlug}.mdx`);

  try {
    const source = await fs.readFile(fullPath, "utf8");
    const rssComponents = await createRSSComponents();

    const { content, frontmatter } = await compileMDX<ProjectFrontMatter>({
      source,
      components: rssComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        },
      },
    });

    if (frontmatter.draft) {
      return null;
    }

    return { content, frontmatter };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
type RSSMediaProps = Record<string, unknown> & {
  alt?: string;
  title?: string;
  caption?: string;
};
