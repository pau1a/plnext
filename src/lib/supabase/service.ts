import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface ContactMessageInsert {
  name: string;
  email: string;
  message: string;
  ip_hash: string;
  user_agent?: string | null;
}

interface ServiceDatabase {
  pl_site: {
    Tables: {
      contact_messages: {
        Insert: ContactMessageInsert;
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
