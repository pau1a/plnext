"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/server";
import { moderateComment, type ModerationAction } from "@/lib/moderation/comments";

async function runModerationAction(commentId: string, action: ModerationAction) {
  const actor = await requirePermission("comments:moderate");
  await moderateComment({ commentId, action, actor });
  revalidatePath("/admin/comments");
}

export async function approveComment(id: string) {
  await runModerationAction(id, "approve");
}

export async function rejectComment(id: string) {
  await runModerationAction(id, "reject");
}

export async function markAsSpam(id: string) {
  await runModerationAction(id, "spam");
}
