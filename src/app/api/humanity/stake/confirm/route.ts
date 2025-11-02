// Demo/live behaviour: Live humanity stake confirmation placeholder; returns 501 until escrow reconciliation is implemented.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "stakeId", "txHash"],
  properties: {
    address: { type: "string", description: "Wallet confirming the stake" },
    stakeId: { type: "string", description: "Identifier from stake/create response" },
    txHash: { type: "string", description: "On-chain transaction hash proving stake" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Humanity stake confirmation not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Verify the staking transaction and mark the escrow as active before switching to live mode.",
    },
    { status: 501 },
  );
}
