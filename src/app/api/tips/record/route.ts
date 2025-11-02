// Demo/live behaviour: Live transaction recording placeholder; rejects until on-chain validation and persistence are implemented.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "txHash", "amount", "token", "chain", "postId"],
  properties: {
    address: { type: "string", description: "Sender wallet address" },
    txHash: { type: "string", description: "On-chain transaction hash" },
    amount: { type: "number", description: "Amount transferred" },
    token: { type: "string", description: "Token symbol" },
    chain: { type: "string", description: "Network name" },
    postId: { type: "string", description: "Content identifier" },
    metadata: { type: "object", description: "Optional contextual payload" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Tip recording not implemented in live mode.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Verify the transaction on-chain (or via relayer attestations) and persist the record before switching to live mode.",
    },
    { status: 501 },
  );
}
