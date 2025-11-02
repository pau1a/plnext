// Demo/live behaviour: Live integrity verification placeholder; returns 501 until proof validation is implemented.
import { NextResponse } from "next/server";

const querySchema = {
  type: "object",
  required: ["postId"],
  properties: {
    postId: { type: "string", description: "Content identifier to verify" },
  },
} as const;

export async function GET() {
  return NextResponse.json(
    {
      error: "Integrity verification not implemented in live mode.",
      status: "not_implemented",
      schema: querySchema,
      instructions:
        "Resolve anchored proofs (on-chain or off-chain) and return verification state before swapping to live mode.",
    },
    { status: 501 },
  );
}
