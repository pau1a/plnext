import type { AdminUserRecord } from "./config";
import type { AuthenticatedActor } from "./rbac";

const SESSION_COOKIE_NAME = "plnext-admin-session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1_000;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function signPayload(payload: string, userToken: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  const keyMaterial = encoder.encode(`${secret}:${userToken}`);
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signatureBuffer));
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createSessionValue(user: AdminUserRecord): Promise<string> {
  const issuedAt = Date.now();
  const payload = `${user.id}.${issuedAt}`;
  const signature = await signPayload(payload, user.token);
  return `${payload}.${signature}`;
}

export function createSessionActor(user: AdminUserRecord): AuthenticatedActor {
  return { id: user.id, name: user.name, roles: user.roles };
}

export async function verifySessionValue(
  value: string,
  lookupUser: (id: string) => AdminUserRecord | null,
): Promise<AuthenticatedActor | null> {
  const [userId, issuedRaw, signature] = value.split(".");
  if (!userId || !issuedRaw || !signature) {
    return null;
  }

  const issuedAt = Number.parseInt(issuedRaw, 10);
  if (!Number.isFinite(issuedAt)) {
    return null;
  }

  if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) {
    return null;
  }

  const user = lookupUser(userId);
  if (!user) {
    return null;
  }

  const payload = `${user.id}.${issuedRaw}`;
  const expectedSignature = await signPayload(payload, user.token);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  return createSessionActor(user);
}
