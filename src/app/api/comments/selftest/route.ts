import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ProbeError = Pick<PostgrestError, "message" | "details" | "hint" | "code"> | null;

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envOk = Boolean(url && anon);
    const supabaseWithRpc = supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => { single: () => Promise<unknown> };
    };
    let dbReachable = false;
    try {
      await supabaseWithRpc.rpc("isfinite", { x: 1 }).single();
      dbReachable = true;
    } catch (error) {
      console.warn("Supabase RPC health check failed", error);
    }

    const commentsProbe = await supabase.from("comments").select("id", { count: "exact", head: true });
    const tableExists = commentsProbe.status !== 406;
    const rlsOpen = !commentsProbe.error;

    const probeError: ProbeError = commentsProbe.error
      ? {
          message: commentsProbe.error.message,
          details: commentsProbe.error.details,
          hint: commentsProbe.error.hint,
          code: commentsProbe.error.code,
        }
      : null;

    return NextResponse.json({
      envOk,
      urlPresent: Boolean(url),
      anonPresent: Boolean(anon),
      dbReachable,
      tableExists,
      rlsOpen,
      probeStatus: commentsProbe.status,
      probeError,
    });
  } catch (error) {
    return NextResponse.json({ fatal: String(error) }, { status: 500 });
  }
}
