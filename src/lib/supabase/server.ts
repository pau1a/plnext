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

let client: SupabaseClient<Database> | null = null;

function validateEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const supabaseUrl = validateEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = validateEnv("SUPABASE_SERVICE_ROLE_KEY");

  client = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "plnext-server",
      },
    },
  });

  return client;
}
