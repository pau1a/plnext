import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  ServiceContactMessagesInsert,
  ServiceContactMessagesRow,
  ServiceContactMessagesUpdate,
  ServiceDatabase,
  ServiceModerationAuditLogInsert,
  ServiceModerationAuditLogRow,
  ServiceModerationCommentRow,
  ServiceModerationCommentUpdate,
} from "@/types/supabase";

export type { ServiceDatabase } from "@/types/supabase";

export type CommentStatus = ServiceModerationCommentRow["status"];
export type ContactMessageInsert = ServiceContactMessagesInsert;
export type ContactMessageRow = ServiceContactMessagesRow;
export type ContactMessageUpdate = ServiceContactMessagesUpdate;
export type ModerationCommentRow = ServiceModerationCommentRow;
export type ModerationCommentUpdate = ServiceModerationCommentUpdate;
export type ModerationAuditLogInsert = ServiceModerationAuditLogInsert;
export type ModerationAuditLogRow = ServiceModerationAuditLogRow;

let cachedServiceClient: SupabaseClient<ServiceDatabase, "pl_site"> | null = null;

export function getServiceSupabase(): SupabaseClient<ServiceDatabase, "pl_site"> {
  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ENV_MISSING");
  }

  cachedServiceClient = createClient<ServiceDatabase, "pl_site", "pl_site">(url, serviceKey, {
    auth: { persistSession: false },
    db: { schema: "pl_site" },
  });

  return cachedServiceClient;
}
