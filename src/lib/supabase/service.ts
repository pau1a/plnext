import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  ServiceContactMessagesInsert,
  ServiceContactMessagesRow,
  ServiceDatabase,
  ServiceModerationAuditLogInsert,
  ServiceModerationAuditLogRow,
  ServiceModerationCommentRow,
  ServiceModerationCommentUpdate,
} from "@/types/supabase";

export type CommentStatus = ServiceModerationCommentRow["status"];

export type ContactMessageInsert = ServiceContactMessagesInsert;
export type ContactMessageRow = ServiceContactMessagesRow;
export type ModerationCommentRow = ServiceModerationCommentRow;
export type ModerationCommentUpdate = ServiceModerationCommentUpdate;
export type ModerationAuditLogInsert = ServiceModerationAuditLogInsert;
export type ModerationAuditLogRow = ServiceModerationAuditLogRow;

let cachedServiceClient: SupabaseClient<ServiceDatabase> | null = null;

export function getServiceSupabase(): SupabaseClient<ServiceDatabase> {
  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ENV_MISSING");
  }

  cachedServiceClient = createClient<ServiceDatabase>(url, serviceKey, {
    auth: { persistSession: false },
  });

  return cachedServiceClient;
}
