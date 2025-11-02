// Demo/live behaviour: Returns deterministic sandbox integrity proofs; disabled when wallet mode is live.
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { WalletMode } from "@/types/wallet-demo";

const WALLET_MODE = (process.env.NEXT_PUBLIC_WALLET_MODE ??
  "demo") as WalletMode;

function enforceDemoMode() {
  if (WALLET_MODE !== "demo") {
    return NextResponse.json(
      {
        error: "Integrity demo endpoint only available in demo mode.",
      },
      { status: 403 },
    );
  }
  return null;
}

function deriveDemoHash(postId: string) {
  const digest = createHash("sha256")
    .update(`wallet-demo:${postId}`)
    .digest("hex");
  return `0x${digest}`;
}

export async function GET(request: NextRequest) {
  const modeError = enforceDemoMode();
  if (modeError) {
    return modeError;
  }

  const postId = request.nextUrl.searchParams.get("postId") ?? "wallet-demo";
  if (!postId) {
    return NextResponse.json(
      { error: "postId query parameter is required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      verified: true,
      hash: deriveDemoHash(postId),
      method: "demo",
      notes: "Sandbox proof only. Replace with on-chain verifier before live launch.",
    },
    { status: 200 },
  );
}
