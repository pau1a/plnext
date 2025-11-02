// Demo/live behaviour: Live SIWE verification placeholder; returns 501 until wired to real signer validation.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["message", "signature"],
  properties: {
    message: { type: "string", description: "Serialized SIWE message" },
    signature: { type: "string", description: "Wallet signature over the SIWE message" },
    nonce: { type: "string", description: "Optional nonce when using custom verifiers" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "SIWE verification not implemented yet.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Validate SIWE message, issue a session token, and store it server-side before switching to live mode.",
    },
    { status: 501 },
  );
}
