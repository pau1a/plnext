import { getBlogPostSummaries, getProjectSummaries } from "@/lib/mdx";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseRoutes: MetadataRoute.Sitemap = ["", "/about", "/projects", "/blog", "/contact"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
  }));

  const posts = await getBlogPostSummaries();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const projects = await getProjectSummaries();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(project.date),
  }));

  return [...baseRoutes, ...postRoutes, ...projectRoutes];
}
