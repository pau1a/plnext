"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import matter from "gray-matter";

import { requirePermission } from "@/lib/auth/server";
import { ensureSlug } from "@/lib/slugify";
import { resolveTagSlugs } from "@/lib/tags";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface BlogActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateBlogPostAction(
  _prevState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePermission("audit:read");

  const fileSlug = formData.get("fileSlug");
  const body = formData.get("body");
  const frontmatterKeysRaw = formData.get("frontmatterKeys");

  if (typeof fileSlug !== "string" || !SLUG_PATTERN.test(fileSlug)) {
    return { status: "error", message: "Invalid blog identifier." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Blog body cannot be empty." };
  }

  if (typeof frontmatterKeysRaw !== "string") {
    return { status: "error", message: "Front matter details are missing." };
  }

  let frontmatterKeys: string[];
  try {
    const parsedKeys = JSON.parse(frontmatterKeysRaw);
    if (!Array.isArray(parsedKeys)) {
      throw new Error("Invalid key list");
    }
    frontmatterKeys = parsedKeys;
  } catch {
    return { status: "error", message: "Could not parse the front matter fields." };
  }

  if (!frontmatterKeys.includes("slug")) {
    frontmatterKeys = ["slug", ...frontmatterKeys];
  }

  const filePath = path.join(BLOG_DIR, `${fileSlug}.mdx`);

  try {
    await fs.access(filePath);
  } catch {
    return { status: "error", message: "Blog post file could not be found." };
  }

  let existingContent: string;
  try {
    existingContent = await fs.readFile(filePath, "utf8");
  } catch {
    return { status: "error", message: "Failed to read the existing blog post." };
  }

  const parsedExisting = matter(existingContent);
  const newline = existingContent.includes("\r\n") ? "\r\n" : "\n";

  const frontmatter: Record<string, string | boolean | string[]> = {};

  for (const key of frontmatterKeys) {
    const typeHint = formData.get(`__type__${key}`);
    const values = formData.getAll(key);
    const rawValue = values.length > 0 ? values[values.length - 1] : "";
    const valueAsString = typeof rawValue === "string" ? rawValue : "";
    const existingValue = parsedExisting.data?.[key];

    const isBoolean =
      typeHint === "boolean" ||
      typeof existingValue === "boolean" ||
      valueAsString === "true" ||
      valueAsString === "false";

    if (isBoolean) {
      frontmatter[key] = valueAsString === "true";
      continue;
    }

    const isArray = typeHint === "array" || Array.isArray(existingValue) || key === "tags";

    if (isArray) {
      const tags = valueAsString
        .split(/[,\n]+/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      frontmatter[key] = tags;
      continue;
    }

    frontmatter[key] = valueAsString;
  }

  if (typeof frontmatter.title !== "string" || frontmatter.title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if (typeof frontmatter.date !== "string" || frontmatter.date.trim() === "") {
    return { status: "error", message: "Publish date cannot be empty." };
  }

  if (typeof frontmatter.description !== "string" || frontmatter.description.trim() === "") {
    return { status: "error", message: "Description cannot be empty." };
  }

  const derivedSlug = ensureSlug(frontmatter.title, fileSlug);
  frontmatter.slug = derivedSlug;

  const { tags: resolvedTags, invalid: invalidTags } = resolveTagSlugs(
    Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
  );

  if (invalidTags.length > 0) {
    return {
      status: "error",
      message: `Unknown tags: ${invalidTags.join(", ")}. Update the shared tag registry before using new tags.`,
    };
  }

  frontmatter.tags = resolvedTags;

  const newlineRegex = newline === "\r\n" ? /^\r?\n+/ : /^\n+/;
  let normalizedBody = body.replace(/\r?\n/g, newline).replace(newlineRegex, "");

  if (!normalizedBody.endsWith(newline)) {
    normalizedBody += newline;
  }

  const serializedFrontmatter = serializeFrontmatter(frontmatter, frontmatterKeys, newline);
  const updatedContent = `${serializedFrontmatter}${newline}${newline}${normalizedBody}`;

  try {
    await fs.writeFile(filePath, updatedContent, "utf8");
  } catch {
    return { status: "error", message: "Failed to write changes to disk." };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/writing");
  revalidatePath(`/writing/${fileSlug}`);
  if (derivedSlug !== fileSlug) {
    revalidatePath(`/writing/${derivedSlug}`);
  }

  return { status: "success", message: "Blog post updated successfully." };
}

function serializeFrontmatter(
  frontmatter: Record<string, string | boolean | string[]>,
  order: string[],
  newline: string,
): string {
  const lines = order.map((key) => {
    const value = frontmatter[key];

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${key}: []`;
      }

      const items = value
        .map((item) => `  - ${formatScalarValue(item)}`)
        .join(newline);
      return `${key}:${newline}${items}`;
    }

    return `${key}: ${formatScalarValue(value)}`;
  });

  return ["---", ...lines, "---"].join(newline);
}

function formatScalarValue(value: string | boolean | undefined): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  const raw = value ?? "";
  const escaped = String(raw).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export async function createBlogPostAction(
  _prevState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePermission("audit:read");

  const title = formData.get("title");
  const date = formData.get("date");
  const description = formData.get("description");
  const tagsRaw = formData.get("tags");
  const draftRaw = formData.get("draft");
  const body = formData.get("body");
  const slug = formData.get("slug");

  if (typeof title !== "string" || title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if (typeof date !== "string" || date.trim() === "") {
    return { status: "error", message: "Publish date cannot be empty." };
  }

  if (typeof description !== "string" || description.trim() === "") {
    return { status: "error", message: "Description cannot be empty." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Blog body cannot be empty." };
  }

  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    return { status: "error", message: "Invalid blog post identifier." };
  }

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  try {
    await fs.access(filePath);
    return { status: "error", message: "A blog post with this title already exists." };
  } catch {
    // File doesn't exist, good to proceed
  }

  const tags = typeof tagsRaw === "string"
    ? tagsRaw
        .split(/[,\n]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const { tags: resolvedTags, invalid: invalidTags } = resolveTagSlugs(tags);

  if (invalidTags.length > 0) {
    return {
      status: "error",
      message: `Unknown tags: ${invalidTags.join(", ")}. Update the shared tag registry before using new tags.`,
    };
  }

  const draft = draftRaw === "on" || draftRaw === "true";

  const frontmatter: Record<string, string | boolean | string[]> = {
    slug,
    title: title.trim(),
    date: date.trim(),
    description: description.trim(),
    draft,
    tags: resolvedTags,
  };

  const frontmatterKeys = ["slug", "title", "date", "description", "draft", "tags"];
  const newline = "\n";

  let normalizedBody = body.replace(/\r?\n/g, newline).replace(/^\n+/, "");

  if (!normalizedBody.endsWith(newline)) {
    normalizedBody += newline;
  }

  const serializedFrontmatter = serializeFrontmatter(frontmatter, frontmatterKeys, newline);
  const fileContent = `${serializedFrontmatter}${newline}${newline}${normalizedBody}`;

  try {
    await fs.writeFile(filePath, fileContent, "utf8");
  } catch {
    return { status: "error", message: "Failed to write blog post to disk." };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/writing");
  revalidatePath("/");
  revalidatePath(`/writing/${slug}`);

  return { status: "success", message: "Blog post created successfully." };
}
