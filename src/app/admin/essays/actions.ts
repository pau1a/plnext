"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

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

  const slug = formData.get("slug");
  const content = formData.get("content");

  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    return { status: "error", message: "Invalid essay identifier." };
  }

  if (typeof content !== "string" || content.trim() === "") {
    return { status: "error", message: "Essay content cannot be empty." };
  }

  const filePath = path.join(ESSAY_DIR, `${slug}.mdx`);

  try {
    await fs.access(filePath);
  } catch (error) {
    return { status: "error", message: "Essay file could not be found." };
  }

  try {
    await fs.writeFile(filePath, content, "utf8");
  } catch (error) {
    return { status: "error", message: "Failed to write changes to disk." };
  }

  revalidatePath("/admin/essays");
  revalidatePath("/essays");
  revalidatePath(`/essays/${slug}`);

  return { status: "success", message: "Essay updated successfully." };
}
