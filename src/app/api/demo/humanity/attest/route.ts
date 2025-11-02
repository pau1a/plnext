// Demo/live behaviour: Simulates humanity attestations with in-memory counters; live mode disables this handler.
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { HumanityAttestResponse, WalletMode } from "@/types/wallet-demo";

const WALLET_MODE = (process.env.NEXT_PUBLIC_WALLET_MODE ??
  "demo") as WalletMode;

interface HumanityPayload {
  address: string;
  attestation: string;
}

const attestationCounts = new Map<string, number>();

function enforceDemoMode() {
  if (WALLET_MODE !== "demo") {
    return NextResponse.json(
      {
        error: "Humanity demo endpoint only available in demo mode.",
      },
      { status: 403 },
    );
  }
  return null;
}

function deriveScore(count: number) {
  const baseline = 40;
  const increment = Math.min(count * 12, 55);
  return Math.min(95, baseline + increment);
}

function buildReceipt({ address, attestation, count }: { address: string; attestation: string; count: number }) {
  const issuedAt = new Date().toISOString();
  const digest = createHash("sha256")
    .update(`demo-humanity:${address}:${attestation}:${count}:${issuedAt}`)
    .digest("hex");

  return {
    demo: true,
    attestation,
    address,
    issuedAt,
    signature: `demo-${digest.slice(0, 32)}`,
    version: "demo-1",
  };
}

export async function POST(request: NextRequest) {
  const modeError = enforceDemoMode();
  if (modeError) {
    return modeError;
  }

  let payload: HumanityPayload;
  try {
    payload = (await request.json()) as HumanityPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Payload must be an object." },
      { status: 400 },
    );
  }

  const { address, attestation } = payload;

  if (typeof address !== "string" || !address.startsWith("0x")) {
    return NextResponse.json(
      { error: "address must be a hex string." },
      { status: 400 },
    );
  }

  if (typeof attestation !== "string" || attestation.length === 0) {
    return NextResponse.json(
      { error: "attestation is required." },
      { status: 400 },
    );
  }

  const current = attestationCounts.get(address) ?? 0;
  const nextCount = current + 1;
  attestationCounts.set(address, nextCount);

  const score = deriveScore(nextCount);
  const receipt = buildReceipt({ address, attestation, count: nextCount });

  const responsePayload: HumanityAttestResponse = {
    ok: true,
    attestationCount: nextCount,
    score,
    receipt,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
