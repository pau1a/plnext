// Demo/live behaviour: Live humanity assertion placeholder; returns 501 until passkey assertions are validated server-side.
import { NextResponse } from "next/server";

const requestSchema = {
  type: "object",
  required: ["address", "assertion"],
  properties: {
    address: { type: "string", description: "Wallet address performing assertion" },
    assertion: { type: "object", description: "WebAuthn assertion response payload" },
  },
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error: "Humanity assertion not implemented.",
      status: "not_implemented",
      schema: requestSchema,
      instructions:
        "Validate WebAuthn assertions and return a signed session token before enabling live mode.",
    },
    { status: 501 },
  );
}
