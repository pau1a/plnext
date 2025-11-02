// Demo/live behaviour: Live anchor endpoint placeholder awaiting smart contract integration; returns 501 until wired.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["postId", "hash", "signature"],
  properties: {
    postId: { type: "string", description: "Content identifier being anchored" },
    hash: { type: "string", description: "Bytes32 hash slated for anchoring" },
    signature: { type: "string", description: "Operator signature authorising the anchor" },
    chain: { type: "string", description: "Target chain for anchoring" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Integrity anchoring not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Deploy PostRegistry.sol, call its anchor method, and persist receipts before enabling live mode.",
    },
    { status: 501 },
  );
}
