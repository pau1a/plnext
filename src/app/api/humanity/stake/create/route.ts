// Demo/live behaviour: Live humanity stake creation placeholder; returns 501 until staking escrow is wired.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "amount", "token"],
  properties: {
    address: { type: "string", description: "Wallet initiating the stake" },
    amount: { type: "number", description: "Stake amount" },
    token: { type: "string", description: "Token symbol" },
    chain: { type: "string", description: "Network where the stake resides" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Humanity stake creation not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Create escrow intents or smart-contract calls and persist pending stakes before enabling live mode.",
    },
    { status: 501 },
  );
}
