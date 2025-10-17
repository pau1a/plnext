import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  PublicCommentsInsert,
  PublicCommentsRow,
  PublicCommentsUpdate,
  PublicPostCommentCountsRow,
  PublicPostsRow,
} from "@/types/supabase";

export type CommentsTableRow = PublicCommentsRow;
export type CommentsTableInsert = PublicCommentsInsert;
export type CommentsTableUpdate = PublicCommentsUpdate;
export type PostsTableRow = PublicPostsRow;
export type PostCommentCountsTableRow = PublicPostCommentCountsRow;

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
