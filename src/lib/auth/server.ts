import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { findUserById, findUserByToken } from "./config";
import { actorHasPermission, describePermission, type AuthenticatedActor, type Permission } from "./rbac";
import {
  createSessionActor,
  createSessionValue,
  getSessionCookieName,
  getSessionCookieOptions,
  verifySessionValue,
} from "./session";

export async function getCurrentActor(): Promise<AuthenticatedActor | null> {
  const cookieName = getSessionCookieName();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(cookieName);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionValue(sessionCookie.value, findUserById);
}

export async function requirePermission(permission: Permission): Promise<AuthenticatedActor> {
  const actor = await getCurrentActor();
  if (!actor || !actorHasPermission(actor, permission)) {
    throw new Error(`Missing permission: ${describePermission(permission)}`);
  }

  return actor;
}

export async function createSession(token: string): Promise<AuthenticatedActor> {
  const user = findUserByToken(token.trim());

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const cookieStore = await cookies();
  const value = await createSessionValue(user);
  cookieStore.set(cookieNameWithOptions(value));
  return createSessionActor(user);
}

function cookieNameWithOptions(value: string) {
  const cookieName = getSessionCookieName();
  const options = getSessionCookieOptions();
  return { name: cookieName, value, ...options } as const;
}

export async function clearSessionCookie() {
  const cookieName = getSessionCookieName();
  const cookieStore = await cookies();
  cookieStore.set({
    name: cookieName,
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  });
}

export function redirectToLogin(nextUrl: URL | string) {
  const url = typeof nextUrl === "string" ? new URL(nextUrl, "http://localhost") : nextUrl;
  const loginUrl = new URL("/admin/login", url.origin);
  const target = typeof nextUrl === "string" ? nextUrl : `${url.pathname}${url.search}`;
  if (target && target !== "/admin/login") {
    loginUrl.searchParams.set("next", target);
  }
  redirect(loginUrl.pathname + loginUrl.search);
}

export async function authenticateRequestToken(): Promise<AuthenticatedActor | null> {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const user = findUserByToken(token);
  if (!user) {
    return null;
  }

  return createSessionActor(user);
}
