// Demo/live behaviour: Live humanity passkey registration placeholder; returns 501 until WebAuthn ceremonies are wired.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address"],
  properties: {
    address: { type: "string", description: "Wallet address binding the credential" },
    challenge: { type: "string", description: "Server-generated WebAuthn challenge" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Humanity registration not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Issue a WebAuthn registration challenge, verify the attestation response, and bind it to the wallet before live launch.",
    },
    { status: 501 },
  );
}
