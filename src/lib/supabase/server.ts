import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { Database } from "@/types/supabase";

import type { Database } from "@/types/supabase";

export type CommentsTableRow = Database["public"]["Tables"]["comments"]["Row"];
export type CommentsTableInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentsTableUpdate = Database["public"]["Tables"]["comments"]["Update"];
export type PostsTableRow = Database["public"]["Tables"]["posts"]["Row"];
export type PostCommentCountsTableRow = Database["public"]["Tables"]["post_comment_counts"]["Row"];


let cachedClient: SupabaseClient<Database, "public", "public"> | null = null;

export function getSupabase(): SupabaseClient<Database, "public", "public"> {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  cachedClient = createClient<Database, "public", "public">(url, anonKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });

  return cachedClient;
}
