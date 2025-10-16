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

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase env vars missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents) in .env.local",
  );
}

let client: SupabaseClient<Database> | null = null;

function createServerClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (!client) {
    client = createServerClient();
  }

  return client;
}

export const supabase = getSupabaseServerClient();
