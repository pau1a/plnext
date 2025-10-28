"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import matter from "gray-matter";

import { requirePermission } from "@/lib/auth/server";
import { ensureSlug } from "@/lib/slugify";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface ProjectActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateProjectAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requirePermission("audit:read");

  const fileSlug = formData.get("fileSlug");
  const body = formData.get("body");
  const frontmatterKeysRaw = formData.get("frontmatterKeys");

  if (typeof fileSlug !== "string" || !SLUG_PATTERN.test(fileSlug)) {
    return { status: "error", message: "Invalid project identifier." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Project body cannot be empty." };
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

  const filePath = path.join(PROJECTS_DIR, `${fileSlug}.mdx`);

  try {
    await fs.access(filePath);
  } catch {
    return { status: "error", message: "Project file could not be found." };
  }

  let existingContent: string;
  try {
    existingContent = await fs.readFile(filePath, "utf8");
  } catch {
    return { status: "error", message: "Failed to read the existing project." };
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

    const isArray = typeHint === "array" || Array.isArray(existingValue) || key === "stack";

    if (isArray) {
      const items = valueAsString
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      frontmatter[key] = items;
      continue;
    }

    frontmatter[key] = valueAsString;
  }

  if (typeof frontmatter.title !== "string" || frontmatter.title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if (typeof frontmatter.date !== "string" || frontmatter.date.trim() === "") {
    return { status: "error", message: "Delivery date cannot be empty." };
  }

  const derivedSlug = ensureSlug(frontmatter.title, fileSlug);
  frontmatter.slug = derivedSlug;

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

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath(`/projects/${fileSlug}`);
  if (derivedSlug !== fileSlug) {
    revalidatePath(`/projects/${derivedSlug}`);
  }

  return { status: "success", message: "Project updated successfully." };
}

export async function createProjectAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requirePermission("audit:read");

  const title = formData.get("title");
  const date = formData.get("date");
  const summary = formData.get("summary");
  const role = formData.get("role");
  const status = formData.get("status");
  const stack = formData.get("stack");
  const draft = formData.get("draft");
  const body = formData.get("body");
  const slug = formData.get("slug");

  if (typeof title !== "string" || title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if (typeof date !== "string" || date.trim() === "") {
    return { status: "error", message: "Delivery date cannot be empty." };
  }

  if (typeof summary !== "string" || summary.trim() === "") {
    return { status: "error", message: "Summary cannot be empty." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Project body cannot be empty." };
  }

  const derivedSlug = typeof slug === "string" && slug.trim() !== ""
    ? slug
    : ensureSlug(title, "");

  if (!SLUG_PATTERN.test(derivedSlug)) {
    return { status: "error", message: "Generated slug contains invalid characters." };
  }

  const filePath = path.join(PROJECTS_DIR, `${derivedSlug}.mdx`);

  // Check if file already exists
  try {
    await fs.access(filePath);
    return { status: "error", message: `A project with slug "${derivedSlug}" already exists.` };
  } catch {
    // File doesn't exist, which is what we want
  }

  const frontmatter: Record<string, string | boolean | string[]> = {
    slug: derivedSlug,
    title: title.trim(),
    date: date.trim(),
    summary: summary.trim(),
  };

  if (typeof role === "string" && role.trim() !== "") {
    frontmatter.role = role.trim();
  }

  if (typeof status === "string" && status.trim() !== "") {
    frontmatter.status = status.trim();
  }

  if (typeof stack === "string" && stack.trim() !== "") {
    const stackItems = stack
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (stackItems.length > 0) {
      frontmatter.stack = stackItems;
    }
  }

  if (draft === "on") {
    frontmatter.draft = true;
  }

  const frontmatterKeys = ["slug", "title", "date", "summary"];
  if (frontmatter.role) frontmatterKeys.push("role");
  if (frontmatter.status) frontmatterKeys.push("status");
  if (frontmatter.stack) frontmatterKeys.push("stack");
  if (frontmatter.draft) frontmatterKeys.push("draft");

  const newline = "\n";
  let normalizedBody = body.replace(/\r?\n/g, newline).trim();

  if (!normalizedBody.endsWith(newline)) {
    normalizedBody += newline;
  }

  const serializedFrontmatter = serializeFrontmatter(frontmatter, frontmatterKeys, newline);
  const fileContent = `${serializedFrontmatter}${newline}${newline}${normalizedBody}`;

  try {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    await fs.writeFile(filePath, fileContent, "utf8");
  } catch {
    return { status: "error", message: "Failed to write project file to disk." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath(`/projects/${derivedSlug}`);

  return { status: "success", message: "Project created successfully!" };
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
