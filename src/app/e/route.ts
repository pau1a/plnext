import { NextRequest, NextResponse } from "next/server";

function disabledInProd() {
  return (
    process.env.NODE_ENV !== "development" &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_STUB !== "true"
  );
}

export async function POST(req: NextRequest) {
  if (disabledInProd()) {
    return new NextResponse("Stub disabled", { status: 410 });
  }

  const body = await req.text();
  console.log("[UMAMI STUB] POST /e payload:", body);
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  if (disabledInProd()) {
    return new NextResponse("Stub disabled", { status: 410 });
  }

  return NextResponse.json({ ok: true, stub: "umami-collector" });
}
