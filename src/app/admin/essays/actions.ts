"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import matter from "gray-matter";

import { requirePermission } from "@/lib/auth/server";

const ESSAY_DIR = path.join(process.cwd(), "content", "writing");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface EssayActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateEssayAction(
  _prevState: EssayActionState,
  formData: FormData,
): Promise<EssayActionState> {
  await requirePermission("audit:read");

  const fileSlug = formData.get("fileSlug");
  const body = formData.get("body");
  const frontmatterKeysRaw = formData.get("frontmatterKeys");

  if (typeof fileSlug !== "string" || !SLUG_PATTERN.test(fileSlug)) {
    return { status: "error", message: "Invalid essay identifier." };
  }

  if (typeof body !== "string" || body.trim() === "") {
    return { status: "error", message: "Essay body cannot be empty." };
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

  const filePath = path.join(ESSAY_DIR, `${fileSlug}.mdx`);

  try {
    await fs.access(filePath);
  } catch {
    return { status: "error", message: "Essay file could not be found." };
  }

  let existingContent: string;
  try {
    existingContent = await fs.readFile(filePath, "utf8");
  } catch {
    return { status: "error", message: "Failed to read the existing essay." };
  }

  const parsedExisting = matter(existingContent);
  const newline = existingContent.includes("\r\n") ? "\r\n" : "\n";

  const frontmatter: Record<string, string | boolean> = {};

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
    } else {
      frontmatter[key] = valueAsString;
    }
  }

  if ("title" in frontmatter && typeof frontmatter.title === "string" && frontmatter.title.trim() === "") {
    return { status: "error", message: "Title cannot be empty." };
  }

  if ("slug" in frontmatter && typeof frontmatter.slug === "string" && frontmatter.slug.trim() === "") {
    return { status: "error", message: "Slug cannot be empty." };
  }

  if ("date" in frontmatter && typeof frontmatter.date === "string" && frontmatter.date.trim() === "") {
    return { status: "error", message: "Date cannot be empty." };
  }

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

  revalidatePath("/admin/essays");
  revalidatePath("/essays");
  revalidatePath(`/essays/${fileSlug}`);

  return { status: "success", message: "Essay updated successfully." };
}

function serializeFrontmatter(
  frontmatter: Record<string, string | boolean>,
  order: string[],
  newline: string,
): string {
  const lines = order.map((key) => {
    const value = frontmatter[key];
    return `${key}: ${formatFrontmatterValue(value)}`;
  });

  return ["---", ...lines, "---"].join(newline);
}

function formatFrontmatterValue(value: string | boolean | undefined): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  const raw = value ?? "";
  const escaped = String(raw).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}
