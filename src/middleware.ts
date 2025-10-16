import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requestHasPermission } from "@/lib/auth/edge";

const ADMIN_LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const hasPermission = await requestHasPermission(request, "comments:moderate");
  if (hasPermission) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = ADMIN_LOGIN_PATH;
  redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
