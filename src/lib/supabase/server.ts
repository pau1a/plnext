import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CommentStatus = "pending" | "approved" | "spam";

export interface CommentsTableRow {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  body: string;
  created_at: string;
  status: CommentStatus;
  ip_hash: string | null;
}

export interface CommentsTableInsert {
  post_slug: string;
  author_name: string;
  author_email: string;
  body: string;
  status: CommentStatus;
  ip_hash: string | null;
}

interface Database {
  public: {
    Tables: {
      comments: {
        Row: CommentsTableRow;
        Insert: CommentsTableInsert;
      };
    };
  };
}

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  cachedClient = createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
