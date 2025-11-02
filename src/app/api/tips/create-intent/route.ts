// Demo/live behaviour: Live payment intent creation placeholder; returns 501 until relayer or contract flow is wired.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "amount", "token", "chain", "postId"],
  properties: {
    address: { type: "string", description: "Sender wallet address" },
    amount: { type: "number", description: "Tip amount as a decimal" },
    token: { type: "string", description: "Token symbol (e.g. USDC, ETH)" },
    chain: { type: "string", description: "Target network (e.g. Arbitrum)" },
    postId: { type: "string", description: "Content identifier to tie the tip to" },
    metadata: { type: "object", description: "Optional payload for relayers or analytics" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Tip intent creation not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Create a payment intent or relayer job and return an intent identifier plus expiry before enabling live mode.",
    },
    { status: 501 },
  );
}
