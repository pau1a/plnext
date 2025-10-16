import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface ContactMessageInsert {
  name: string;
  email: string;
  message: string;
  ip_hash: string;
  user_agent?: string | null;
}

export interface ModerationCommentRow {
  id: string;
  slug: string;
  author_name: string;
  author_email: string | null;
  content: string;
  status: CommentStatus;
  is_spam: boolean;
  ip_hash: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
}

export interface ModerationCommentUpdate {
  status?: CommentStatus;
  moderated_at?: string | null;
  updated_at?: string;
  is_spam?: boolean;
}

export interface ModerationAuditLogInsert {
  comment_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  actor_roles: string[];
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

interface ServiceDatabase {
  pl_site: {
    Tables: {
      contact_messages: {
        Insert: ContactMessageInsert;
      };
      comments: {
        Row: ModerationCommentRow;
        Update: ModerationCommentUpdate;
      };
      moderation_audit_log: {
        Insert: ModerationAuditLogInsert;
      };
    };
  };
}

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
