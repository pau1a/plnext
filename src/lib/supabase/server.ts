import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface CommentsTableRow {
  id: string;
  slug: string;
  author: string;
  content: string;
  created_at: string;
}

export interface CommentsTableInsert {
  slug: string;
  author: string;
  content: string;
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
