import type { NextRequest } from "next/server";

import { findUserById } from "./config";
import { actorHasPermission, type AuthenticatedActor, type Permission } from "./rbac";
import { getSessionCookieName, verifySessionValue } from "./session";

export async function getActorFromRequest(request: NextRequest): Promise<AuthenticatedActor | null> {
  const cookieName = getSessionCookieName();
  const sessionCookie = request.cookies.get(cookieName);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionValue(sessionCookie.value, findUserById);
}

export async function requestHasPermission(
  request: NextRequest,
  permission: Permission,
): Promise<boolean> {
  const actor = await getActorFromRequest(request);
  return actor ? actorHasPermission(actor, permission) : false;
}
