// Demo/live behaviour: Records sandbox tip payloads and emits fake hashes; rejects when wallet mode is not demo.
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type {
  DemoTipPayload,
  DemoTipRecord,
  DemoTipResponse,
  WalletMode,
} from "@/types/wallet-demo";

const WALLET_MODE = (process.env.NEXT_PUBLIC_WALLET_MODE ??
  "demo") as WalletMode;

const tipStore: DemoTipRecord[] = [];
const RATE_LIMIT_MAX = 25;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestWindows = new Map<string, { count: number; windowStart: number }>();

function enforceDemoMode() {
  if (WALLET_MODE !== "demo") {
    return NextResponse.json(
      {
        error: "Demo endpoints are disabled outside NEXT_PUBLIC_WALLET_MODE=demo.",
      },
      { status: 403 },
    );
  }
  return null;
}

function rateLimit(key: string) {
  const now = Date.now();
  const entry = requestWindows.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

function resolveClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.ip ??
    "local"
  );
}

function generateFakeTxHash() {
  return `0x${randomBytes(32).toString("hex")}`;
}

export async function POST(request: NextRequest) {
  const modeError = enforceDemoMode();
  if (modeError) {
    return modeError;
  }

  const clientKey = resolveClientKey(request);
  if (!rateLimit(clientKey)) {
    return NextResponse.json(
      {
        error: "Too many demo tip requests. Please slow down.",
      },
      { status: 429 },
    );
  }

  let payload: DemoTipPayload | null = null;
  try {
    payload = (await request.json()) as DemoTipPayload;
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

  const { address, amount, token, chain, postId, ts, note } = payload;

  if (typeof address !== "string" || !address.startsWith("0x")) {
    return NextResponse.json(
      { error: "address must be a hex string." },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number." },
      { status: 400 },
    );
  }

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json(
      { error: "token is required." },
      { status: 400 },
    );
  }

  if (typeof chain !== "string" || chain.length === 0) {
    return NextResponse.json(
      { error: "chain is required." },
      { status: 400 },
    );
  }

  if (typeof postId !== "string" || postId.length === 0) {
    return NextResponse.json(
      { error: "postId is required." },
      { status: 400 },
    );
  }

  if (typeof ts !== "string") {
    return NextResponse.json(
      { error: "ts must be an ISO timestamp string." },
      { status: 400 },
    );
  }

  const txHash = generateFakeTxHash();
  const record: DemoTipRecord = {
    address,
    amount,
    token,
    chain,
    postId,
    note,
    ts,
    txHash,
    demo: true,
  };

  tipStore.unshift(record);
  if (tipStore.length > 100) {
    tipStore.pop();
  }

  const responsePayload: DemoTipResponse = {
    ok: true,
    txHash,
    record,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
