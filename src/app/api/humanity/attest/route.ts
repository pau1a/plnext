// Demo/live behaviour: Live humanity attestation placeholder; returns 501 until staking and attestation flows exist.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "attestation"],
  properties: {
    address: { type: "string", description: "Wallet address being attested" },
    attestation: { type: "string", description: "Attestation source identifier" },
    proof: { type: "object", description: "Proof payload (signature, credential, etc.)" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Humanity attestation not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Validate proof, update attestation ledger, and emit receipts before switching to live mode.",
    },
    { status: 501 },
  );
}
