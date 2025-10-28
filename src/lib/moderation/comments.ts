import "server-only";

import { revalidateTag } from "next/cache";

import type { AuthenticatedActor } from "@/lib/auth/rbac";
import { BLOG_LIST_CACHE_TAG, getBlogPostCacheTag } from "@/lib/supabase/blog";
import {
  getServiceSupabase,
  type CommentStatus,
  type ModerationAuditLogInsert,
  type ModerationCommentRow,
  type ModerationCommentUpdate,
} from "@/lib/supabase/service";

export type ModerationAction = "approve" | "reject" | "spam" | "pending";

export interface ModerationQueueFilters {
  status?: CommentStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ModerationQueueItem {
  id: string;
  slug: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  moderatedAt: string | null;
  ipHash: string;
  userAgent: string | null;
}

export interface ModerationQueueResult {
  items: ModerationQueueItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const COMMENTS_TABLE = "comments" as const;
const AUDIT_LOG_TABLE = "moderation_audit_log" as const;

type ModerationQueueRow = Pick<
  ModerationCommentRow,
  | "id"
  | "slug"
  | "author_name"
  | "author_email"
  | "content"
  | "status"
  | "created_at"
  | "updated_at"
  | "moderated_at"
  | "ip_hash"
  | "user_agent"
>;
type ModerationSelectionRow = Pick<ModerationCommentRow, "id" | "slug" | "status">;

function clampPageSize(pageSize?: number): number {
  if (!pageSize || !Number.isFinite(pageSize) || pageSize <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.floor(pageSize), MAX_PAGE_SIZE);
}

function normaliseSearchTerm(term: string | undefined): string | undefined {
  if (!term) {
    return undefined;
  }

  const trimmed = term.trim();
  return trimmed.length > 1 ? trimmed : undefined;
}

function mapRow(row: ModerationQueueRow): ModerationQueueItem {
  return {
    id: row.id,
    slug: row.slug,
    authorName: row.author_name,
    authorEmail: row.author_email,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    moderatedAt: row.moderated_at,
    ipHash: row.ip_hash,
    userAgent: row.user_agent,
  };
}

export async function fetchModerationQueue(filters: ModerationQueueFilters): Promise<ModerationQueueResult> {
  const pageSize = clampPageSize(filters.pageSize);
  const page = Math.max(filters.page && Number.isFinite(filters.page) ? Math.floor(filters.page) : 1, 1);
  const search = normaliseSearchTerm(filters.search);

  const supabase = getServiceSupabase();
  const schemaClient = supabase.schema("pl_site");
  let query = schemaClient
    .from(COMMENTS_TABLE)
    .select(
      "id, slug, author_name, author_email, content, status, created_at, updated_at, moderated_at, ip_hash, user_agent",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (search) {
    const pattern = `%${search}%`;
    query = query.or(
      [
        `slug.ilike.${pattern}`,
        `author_name.ilike.${pattern}`,
        `author_email.ilike.${pattern}`,
        `content.ilike.${pattern}`,
      ].join(","),
    );
  }

  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);

  if (error) {
    console.error("Supabase query error:", JSON.stringify(error, null, 2));
    throw error;
  }

  const total = count ?? 0;
  const rows = (data ?? []) as ModerationQueueRow[];
  const items = rows.map((row) => mapRow(row));
  const hasNextPage = rangeEnd + 1 < total;
  const hasPreviousPage = rangeStart > 0;

  return { items, totalCount: total, page, pageSize, hasNextPage, hasPreviousPage };
}

function resolveStatusForAction(action: ModerationAction): CommentStatus {
  switch (action) {
    case "approve":
      return "approved";
    case "spam":
      return "spam";
    case "pending":
      return "pending";
    default:
      return "rejected";
  }
}

function buildUpdate(action: ModerationAction, now: string): ModerationCommentUpdate {
  const status = resolveStatusForAction(action);
  const update: ModerationCommentUpdate = {
    status,
    moderated_at: action === "pending" ? null : now,
    updated_at: now,
  };

  if (action === "reject" || action === "pending") {
    update.is_spam = false;
  }

  if (action === "spam") {
    update.is_spam = true;
  }

  return update;
}

function buildAuditEntry(
  commentId: string,
  slug: string,
  action: ModerationAction,
  actor: AuthenticatedActor,
  reason?: string,
): ModerationAuditLogInsert {
  const timestamp = new Date().toISOString();
  return {
    comment_id: commentId,
    action,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_roles: actor.roles,
    metadata: reason ? { slug, reason } : { slug },
    created_at: timestamp,
  };
}

export interface ModerateCommentResult {
  status: CommentStatus;
  slug: string;
}

export interface ModerateCommentOptions {
  commentId: string;
  action: ModerationAction;
  actor: AuthenticatedActor;
  reason?: string;
}

export async function moderateComment({ commentId, action, actor, reason }: ModerateCommentOptions): Promise<ModerateCommentResult> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const update = buildUpdate(action, now);

  const schemaClient = supabase.schema("pl_site");
  const commentsClient = schemaClient.from(COMMENTS_TABLE);
  const { data, error } = await commentsClient
    .update<ModerationCommentUpdate>(update)
    .eq("id", commentId)
    .select("id, slug, status")
    .limit(1)
    .maybeSingle<ModerationSelectionRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  const auditEntry = buildAuditEntry(data.id, data.slug, action, actor, reason?.trim() || undefined);
  const { error: auditError } = await schemaClient
    .from(AUDIT_LOG_TABLE)
    .insert<ModerationAuditLogInsert>(auditEntry);
  if (auditError) {
    throw auditError;
  }

  await revalidateTag(BLOG_LIST_CACHE_TAG);
  await revalidateTag(getBlogPostCacheTag(data.slug));

  return { status: data.status, slug: data.slug };
}
