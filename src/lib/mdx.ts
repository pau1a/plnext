import fs from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export interface BlogPostFrontMatter {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  draft?: boolean;
}

export interface ProjectFrontMatter {
  title: string;
  date: string;
  summary: string;
  role?: string;
  status?: string;
  stack?: string[];
  draft?: boolean;
}

export interface BlogPostSummary extends BlogPostFrontMatter {
  slug: string;
}

export interface ProjectSummary extends ProjectFrontMatter {
  slug: string;
}

export interface BlogPost extends BlogPostSummary {
  content: ReactNode;
}

export interface ProjectDocument extends ProjectSummary {
  content: ReactNode;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");

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

export async function getBlogPostSummaries(): Promise<BlogPostSummary[]> {
  const files = await readDirectory(BLOG_DIR);

  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const data = await readFrontMatter<BlogPostFrontMatter>(BLOG_DIR, file);
      return { slug, ...data } satisfies BlogPostSummary;
    }),
  );

  return posts
    .filter((post) => !post.draft)
    .sort(sortByDateDesc);
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const files = await readDirectory(PROJECTS_DIR);

  const projects = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const data = await readFrontMatter<ProjectFrontMatter>(PROJECTS_DIR, file);
      return { slug, ...data } satisfies ProjectSummary;
    }),
  );

  return projects
    .filter((project) => !project.draft)
    .sort(sortByDateDesc);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);

  try {
    const source = await fs.readFile(fullPath, "utf8");
    const { content, frontmatter } = await compileMDX<BlogPostFrontMatter>({
      source,
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

    return { slug, content, ...frontmatter } satisfies BlogPost;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function getProjectDocument(slug: string): Promise<ProjectDocument | null> {
  const fullPath = path.join(PROJECTS_DIR, `${slug}.mdx`);

  try {
    const source = await fs.readFile(fullPath, "utf8");
    const { content, frontmatter } = await compileMDX<ProjectFrontMatter>({
      source,
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

    return { slug, content, ...frontmatter } satisfies ProjectDocument;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function getBlogSlugs() {
  const files = await readDirectory(BLOG_DIR);
  return files.map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

export async function getProjectSlugs() {
  const files = await readDirectory(PROJECTS_DIR);
  return files.map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}
