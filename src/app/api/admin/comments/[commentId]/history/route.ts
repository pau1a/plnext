import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/server";
import { getServiceSupabase, type CommentStatus } from "@/lib/supabase/service";

const commentIdSchema = z.string().uuid();

interface HistoryEntry {
  status: CommentStatus;
  action: string;
  actorName: string | null;
  timestamp: string;
  reason: string | null;
}

function resolveStatus(action: string, fallback: CommentStatus): CommentStatus {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "spam":
      return "spam";
    case "pending":
      return "pending";
    default:
      return fallback;
  }
}

function extractReason(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as Record<string, unknown>).reason;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await context.params;
  const parseResult = commentIdSchema.safeParse(commentId);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  await requirePermission("comments:moderate");

  try {
    const supabase = getServiceSupabase();
    const schemaClient = supabase.schema("pl_site");

    const { data: comment, error: commentError } = await schemaClient
      .from("comments")
      .select("id, status, created_at, author_name")
      .eq("id", commentId)
      .limit(1)
      .maybeSingle();

    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 500 });
    }

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const { data: auditRows, error: auditError } = await schemaClient
      .from("moderation_audit_log")
      .select("action, actor_name, metadata, created_at")
      .eq("comment_id", commentId)
      .order("created_at", { ascending: true });

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    const history: HistoryEntry[] = [
      {
        status: "pending",
        action: "submitted",
        actorName: comment.author_name,
        timestamp: comment.created_at,
        reason: null,
      },
    ];

    for (const row of auditRows ?? []) {
      const status = resolveStatus(row.action, comment.status);
      history.push({
        status,
        action: row.action,
        actorName: row.actor_name,
        timestamp: row.created_at,
        reason: extractReason(row.metadata),
      });
    }

    return NextResponse.json({ entries: history });
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_SERVICE_ENV_MISSING") {
      return NextResponse.json(
        {
          error:
            "Supabase service credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to view comment history.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to access Supabase" },
      { status: 500 },
    );
  }
}
