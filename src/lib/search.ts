import { getEssays } from "./writing";
import type { EssaySummary } from "./writing";
import { getBlogPostSummaries } from "./mdx";
import type { BlogPostSummary, BlogPostFrontMatter, ProjectSummary, ProjectFrontMatter } from "./mdx";
import { getProjectSummaries } from "./mdx";
import { getNotes } from "./notes";
import type { NoteSummary } from "./notes";
import { loadStream } from "./stream";
import type { StreamEntry } from "./stream";
import { stripMarkdown } from "./notes";
import { ensureSlug } from "./slugify";
import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

// Helper function to read MDX files from a directory
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

export type SearchResultType = "essay" | "blog" | "project" | "note" | "stream";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  slug: string;
  href: string;
  excerpt: string;
  date: string;
  tags?: string[];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createExcerpt(text: string, query: string, maxLength = 200): string {
  const cleanText = stripMarkdown(text);

  // Try to find the query in the text
  const lowerText = cleanText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryIndex = lowerText.indexOf(lowerQuery);

  if (queryIndex === -1) {
    // Query not found, return beginning
    return cleanText.slice(0, maxLength) + (cleanText.length > maxLength ? "..." : "");
  }

  // Show context around the match
  const contextStart = Math.max(0, queryIndex - 50);
  const contextEnd = Math.min(cleanText.length, queryIndex + query.length + maxLength - 50);

  let excerpt = cleanText.slice(contextStart, contextEnd);

  if (contextStart > 0) {
    excerpt = "..." + excerpt;
  }
  if (contextEnd < cleanText.length) {
    excerpt = excerpt + "...";
  }

  return excerpt.trim();
}

function searchInText(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Split query into words and check if all words are present
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  return words.every(word => lowerText.includes(word));
}

// Helper to load blog posts with body content for searching
async function loadBlogPostsWithBody(): Promise<Array<BlogPostSummary & { body: string }>> {
  const files = await readDirectory(BLOG_DIR);

  const posts = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(BLOG_DIR, file);
      const raw = await fs.readFile(fullPath, "utf8");
      const { data, content: body } = matter(raw);

      const frontMatter = data as BlogPostFrontMatter;
      const fileSlug = file.replace(/\.mdx$/, "");
      const slug = ensureSlug(frontMatter.slug, fileSlug);

      return {
        fileSlug,
        slug,
        title: frontMatter.title,
        date: frontMatter.date,
        description: frontMatter.description,
        tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
        draft: frontMatter.draft,
        body,
      } as BlogPostSummary & { body: string };
    })
  );

  return posts.filter(post => !post.draft);
}

// Helper to load projects with body content for searching
async function loadProjectsWithBody(): Promise<Array<ProjectSummary & { body: string }>> {
  const files = await readDirectory(PROJECTS_DIR);

  const projects = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(PROJECTS_DIR, file);
      const raw = await fs.readFile(fullPath, "utf8");
      const { data, content: body } = matter(raw);

      const frontMatter = data as ProjectFrontMatter;
      const fileSlug = file.replace(/\.mdx$/, "");
      const slug = ensureSlug(frontMatter.slug, fileSlug);

      return {
        fileSlug,
        slug,
        title: frontMatter.title,
        date: frontMatter.date,
        summary: frontMatter.summary,
        role: frontMatter.role,
        stack: frontMatter.stack,
        draft: frontMatter.draft,
        body,
      } as ProjectSummary & { body: string };
    })
  );

  return projects.filter(project => !project.draft);
}

async function searchEssays(query: string): Promise<SearchResult[]> {
  const essays = await getEssays({ includeDrafts: false });

  return essays
    .filter(essay => {
      const searchText = `${essay.title} ${essay.summary || ""} ${essay.body}`;
      return searchInText(searchText, query);
    })
    .map(essay => ({
      type: "essay" as const,
      title: essay.title,
      slug: essay.slug,
      href: `/writing/${essay.slug}`,
      excerpt: createExcerpt(essay.body || essay.summary || "", query),
      date: essay.date,
    }));
}

async function searchBlogPosts(query: string): Promise<SearchResult[]> {
  const posts = await loadBlogPostsWithBody();

  return posts
    .filter(post => {
      const searchText = `${post.title} ${post.description} ${post.body}`;
      return searchInText(searchText, query);
    })
    .map(post => ({
      type: "blog" as const,
      title: post.title,
      slug: post.slug,
      href: `/writing/${post.slug}`,
      excerpt: post.description || createExcerpt(post.body, query),
      date: post.date,
      tags: post.tags,
    }));
}

async function searchProjects(query: string): Promise<SearchResult[]> {
  const projects = await loadProjectsWithBody();

  return projects
    .filter(project => {
      const searchText = `${project.title} ${project.summary} ${project.role || ""} ${project.stack?.join(" ") || ""} ${project.body}`;
      return searchInText(searchText, query);
    })
    .map(project => ({
      type: "project" as const,
      title: project.title,
      slug: project.slug,
      href: `/projects/${project.slug}`,
      excerpt: project.summary || createExcerpt(project.body, query),
      date: project.date,
    }));
}

async function searchNotes(query: string): Promise<SearchResult[]> {
  const notes = await getNotes({ includeDrafts: false });

  return notes
    .filter(note => {
      const searchText = `${note.title} ${note.summary || ""}`;
      return searchInText(searchText, query);
    })
    .map(note => ({
      type: "note" as const,
      title: note.title,
      slug: note.slug,
      href: `/notes/${note.slug}`,
      excerpt: note.summary || "No summary available",
      date: note.date,
      tags: note.tags,
    }));
}

async function searchStream(query: string): Promise<SearchResult[]> {
  const entries = await loadStream();

  return entries
    .filter(entry => {
      return searchInText(entry.body, query);
    })
    .map(entry => ({
      type: "stream" as const,
      title: createExcerpt(entry.body, query, 100),
      slug: entry.id,
      href: `/stream${entry.anchor}`,
      excerpt: createExcerpt(entry.body, query),
      date: entry.timestamp,
      tags: entry.tags,
    }));
}

export interface SearchOptions {
  query: string;
  types?: SearchResultType[];
}

export async function search(options: SearchOptions): Promise<SearchResult[]> {
  const { query, types } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim();
  const searchTypes = types || ["essay", "blog", "project", "note", "stream"];

  const searchPromises: Promise<SearchResult[]>[] = [];

  if (searchTypes.includes("essay")) {
    searchPromises.push(searchEssays(trimmedQuery));
  }
  if (searchTypes.includes("blog")) {
    searchPromises.push(searchBlogPosts(trimmedQuery));
  }
  if (searchTypes.includes("project")) {
    searchPromises.push(searchProjects(trimmedQuery));
  }
  if (searchTypes.includes("note")) {
    searchPromises.push(searchNotes(trimmedQuery));
  }
  if (searchTypes.includes("stream")) {
    searchPromises.push(searchStream(trimmedQuery));
  }

  const results = await Promise.all(searchPromises);
  const flatResults = results.flat();

  // Sort by date descending
  flatResults.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return flatResults;
}
