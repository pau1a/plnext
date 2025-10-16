"use server";

import { z } from "zod";

import { requirePermission } from "@/lib/auth/server";
import type { ModerationAction } from "@/lib/moderation/comments";
import { moderateComment } from "@/lib/moderation/comments";

const ACTIONS = ["approve", "reject"] as const satisfies ModerationAction[];

const actionSchema = z.object({
  commentId: z.string().uuid("Comment identifier is invalid"),
  slug: z.string().min(1, "Slug is required"),
  action: z.enum(ACTIONS),
  reason: z.string().optional(),
});

export interface ModerationActionResponse {
  ok: boolean;
  error?: string;
}

export async function handleModerationAction(formData: FormData): Promise<ModerationActionResponse> {
  const parsed = actionSchema.safeParse({
    commentId: formData.get("commentId"),
    slug: formData.get("slug"),
    action: formData.get("action"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const actor = await requirePermission("comments:moderate");

  try {
    const reason = parsed.data.reason?.trim();
    await moderateComment({
      commentId: parsed.data.commentId,
      action: parsed.data.action,
      actor,
      reason: reason ? reason.slice(0, 500) : undefined,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Unable to update comment" };
  }
}
