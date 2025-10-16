import { getProjectSummaries } from "@/lib/mdx";
import {
  BLOG_AFTER_PARAM,
  BLOG_INDEX_REVALIDATE_SECONDS,
  createCursorHref,
  getBlogIndexPage,
  type BlogIndexPageResult,
} from "@/lib/supabase/blog";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";
const BLOG_PAGE_SIZE = 6;

export const revalidate = BLOG_INDEX_REVALIDATE_SECONDS;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseRoutes: MetadataRoute.Sitemap = ["", "/about", "/projects", "/blog", "/contact"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
  }));

  const allPosts: BlogIndexPageResult["items"] = [];
  const paginationRoutes: MetadataRoute.Sitemap = [];
  const visitedTokens = new Set<string | null>();
  let afterToken: string | null = null;
  let isFirst = true;

  // Iterate through cursor pages to gather both post URLs and paginated index routes.
  // The visited set protects against a misconfigured cursor that returns duplicate pages.
  while (!visitedTokens.has(afterToken)) {
    visitedTokens.add(afterToken);

    const page = await getBlogIndexPage({ pageSize: BLOG_PAGE_SIZE, after: afterToken });

    if (page.items.length === 0) {
      break;
    }

    if (!isFirst && afterToken) {
      const pageUrl = `${siteUrl}${createCursorHref("/blog", BLOG_AFTER_PARAM, afterToken)}`;
      paginationRoutes.push({
        url: pageUrl,
        lastModified: new Date(page.items[0].date),
      });
    }

    allPosts.push(...page.items);

    if (!page.nextCursor) {
      break;
    }

    afterToken = page.nextCursor;
    isFirst = false;
  }

  const postRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const projects = await getProjectSummaries();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(project.date),
  }));

  try {
    console.info(
      JSON.stringify({
        event: "sitemap-cache-hint",
        revalidate: BLOG_INDEX_REVALIDATE_SECONDS,
        blogIndexPageCount: paginationRoutes.length + 1, // include base `/blog`
        blogPostCount: allPosts.length,
      }),
    );
  } catch (error) {
    console.error("Failed to emit sitemap cache hint:", error);
  }

  return [...baseRoutes, ...paginationRoutes, ...postRoutes, ...projectRoutes];
}
