import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { ServiceDatabase } from "@/types/supabase";

import type { ServiceDatabase } from "@/types/supabase";

type ContactMessagesTable = ServiceDatabase["pl_site"]["Tables"]["contact_messages"];
type ModerationCommentsTable = ServiceDatabase["pl_site"]["Tables"]["comments"];
type ModerationAuditLogTable = ServiceDatabase["pl_site"]["Tables"]["moderation_audit_log"];

export type CommentStatus = ModerationCommentsTable["Row"]["status"];
export type ContactMessageInsert = ContactMessagesTable["Insert"];
export type ContactMessageRow = ContactMessagesTable["Row"];
export type ContactMessageUpdate = ContactMessagesTable["Update"];
export type ModerationCommentRow = ModerationCommentsTable["Row"];
export type ModerationCommentUpdate = ModerationCommentsTable["Update"];
export type ModerationAuditLogInsert = ModerationAuditLogTable["Insert"];
export type ModerationAuditLogRow = ModerationAuditLogTable["Row"];

let cachedServiceClient: SupabaseClient<ServiceDatabase, "pl_site", "pl_site"> | null = null;

export function getServiceSupabase(): SupabaseClient<ServiceDatabase, "pl_site", "pl_site"> {
  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ENV_MISSING");
  }

  cachedServiceClient = createClient<ServiceDatabase, "pl_site">(url, serviceKey, {
    auth: { persistSession: false },
    db: { schema: "pl_site" },
  });

  return cachedServiceClient;
}
