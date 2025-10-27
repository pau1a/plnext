"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import matter from "gray-matter";

import { requirePermission } from "@/lib/auth/server";
import { ensureSlug } from "@/lib/slugify";
import { resolveTagSlugs } from "@/lib/tags";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface NoteActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateNoteAction(
  _prevState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  await requirePermission("audit:read");

  const fileSlug = formData.get("fileSlug");
  const body = formData.get("body");
  const frontmatterKeysRaw = formData.get("frontmatterKeys");

  if (typeof fileSlug !== "string" || !SLUG_PATTERN.test(fileSlug)) {
    return { status: "error", message: "Invalid note identifier." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Note body cannot be empty." };
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

  const filePath = path.join(NOTES_DIR, `${fileSlug}.mdx`);

  try {
    await fs.access(filePath);
  } catch {
    return { status: "error", message: "Note file could not be found." };
  }

  let existingContent: string;
  try {
    existingContent = await fs.readFile(filePath, "utf8");
  } catch {
    return { status: "error", message: "Failed to read the existing note." };
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
        .split(/[\n,]+/)
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

  const derivedSlug = ensureSlug(frontmatter.title, fileSlug);
  frontmatter.slug = derivedSlug;

  const tagValues = Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [];
  const { tags: resolvedTags, invalid } = resolveTagSlugs(tagValues);

  if (invalid.length > 0) {
    return {
      status: "error",
      message: `Unknown tags: ${invalid.join(", ")}. Update the tag registry before using new tags.`,
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

  revalidatePath("/admin/notes");
  revalidatePath("/notes");
  revalidatePath("/");
  revalidatePath(`/notes/${fileSlug}`);
  if (derivedSlug !== fileSlug) {
    revalidatePath(`/notes/${derivedSlug}`);
  }

  return { status: "success", message: "Note updated successfully." };
}

export async function createNoteAction(
  _prevState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  await requirePermission("audit:read");

  const title = formData.get("title");
  const date = formData.get("date");
  const summary = formData.get("summary");
  const tags = formData.get("tags");
  const draft = formData.get("draft");
  const body = formData.get("body");
  const slug = formData.get("slug");

  if (typeof title !== "string" || title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if (typeof date !== "string" || date.trim() === "") {
    return { status: "error", message: "Publish date cannot be empty." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Note body cannot be empty." };
  }

  const derivedSlug = typeof slug === "string" && slug.trim() !== ""
    ? slug
    : ensureSlug(title, "");

  if (!SLUG_PATTERN.test(derivedSlug)) {
    return { status: "error", message: "Generated slug contains invalid characters." };
  }

  const filePath = path.join(NOTES_DIR, `${derivedSlug}.mdx`);

  // Check if file already exists
  try {
    await fs.access(filePath);
    return { status: "error", message: `A note with slug "${derivedSlug}" already exists.` };
  } catch {
    // File doesn't exist, which is what we want
  }

  const frontmatter: Record<string, string | boolean | string[]> = {
    slug: derivedSlug,
    title: title.trim(),
    date: date.trim(),
  };

  if (typeof summary === "string" && summary.trim() !== "") {
    frontmatter.summary = summary.trim();
  }

  if (typeof tags === "string" && tags.trim() !== "") {
    const tagValues = tags
      .split(/[\n,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { tags: resolvedTags, invalid } = resolveTagSlugs(tagValues);

    if (invalid.length > 0) {
      return {
        status: "error",
        message: `Unknown tags: ${invalid.join(", ")}. Update the tag registry before using new tags.`,
      };
    }

    frontmatter.tags = resolvedTags;
  }

  if (draft === "on") {
    frontmatter.draft = true;
  }

  const frontmatterKeys = ["slug", "title", "date"];
  if (frontmatter.summary) frontmatterKeys.push("summary");
  if (frontmatter.tags) frontmatterKeys.push("tags");
  if (frontmatter.draft) frontmatterKeys.push("draft");

  const newline = "\n";
  let normalizedBody = body.replace(/\r?\n/g, newline).trim();

  if (!normalizedBody.endsWith(newline)) {
    normalizedBody += newline;
  }

  const serializedFrontmatter = serializeFrontmatter(frontmatter, frontmatterKeys, newline);
  const fileContent = `${serializedFrontmatter}${newline}${newline}${normalizedBody}`;

  try {
    await fs.mkdir(NOTES_DIR, { recursive: true });
    await fs.writeFile(filePath, fileContent, "utf8");
  } catch {
    return { status: "error", message: "Failed to write note file to disk." };
  }

  revalidatePath("/admin/notes");
  revalidatePath("/notes");
  revalidatePath("/");
  revalidatePath(`/notes/${derivedSlug}`);

  return { status: "success", message: "Note created successfully!" };
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

      const items = value.map((item) => `  - ${formatScalarValue(item)}`).join(newline);
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
