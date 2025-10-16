import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ProbeError = Pick<PostgrestError, "message" | "details" | "hint" | "code"> | null;

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let envOk = true;
    let supabase: ReturnType<typeof getSupabase> | null = null;

    try {
      supabase = getSupabase();
    } catch (error) {
      if (error instanceof Error && error.message === "SUPABASE_ENV_MISSING") {
        envOk = false;
      } else {
        throw error;
      }
    }

    if (!envOk || !supabase) {
      return NextResponse.json({
        envOk: false,
        urlPresent: Boolean(url),
        anonPresent: Boolean(anon),
        dbReachable: false,
        tableExists: false,
        rlsOpen: false,
        probeStatus: 0,
        probeError: { message: "Supabase env vars missing" },
      });
    }

    const commentsProbe = await supabase.from("comments").select("id", { count: "exact", head: true });
    const tableExists =
      !commentsProbe.error || !/relation \"?comments\"? does not exist/i.test(commentsProbe.error.message ?? "");
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
      dbReachable: true,
      tableExists,
      rlsOpen,
      probeStatus: commentsProbe.status,
      probeError,
    });
  } catch (error) {
    return NextResponse.json({ fatal: String(error) }, { status: 500 });
  }
}
