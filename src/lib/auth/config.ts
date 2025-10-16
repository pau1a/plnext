import { cache } from "react";

import type { AuthenticatedActor, Role } from "./rbac";

interface RawUserConfig {
  id: unknown;
  name: unknown;
  token: unknown;
  roles: unknown;
}

export interface AdminUserRecord extends AuthenticatedActor {
  token: string;
}

function normaliseRole(value: string): Role | null {
  if (value === "admin" || value === "moderator" || value === "viewer") {
    return value;
  }

  return null;
}

function parseUserConfig(entry: RawUserConfig): AdminUserRecord {
  if (typeof entry.id !== "string" || !entry.id.trim()) {
    throw new Error("ADMIN_AUTH_USERS entry is missing an id");
  }

  if (typeof entry.name !== "string" || !entry.name.trim()) {
    throw new Error(`ADMIN_AUTH_USERS entry ${entry.id} is missing a name`);
  }

  if (typeof entry.token !== "string" || !entry.token.trim()) {
    throw new Error(`ADMIN_AUTH_USERS entry ${entry.id} is missing a token`);
  }

  if (!Array.isArray(entry.roles) || entry.roles.length === 0) {
    throw new Error(`ADMIN_AUTH_USERS entry ${entry.id} must include at least one role`);
  }

  const roles: Role[] = [];
  for (const rawRole of entry.roles) {
    if (typeof rawRole !== "string") {
      continue;
    }

    const normalised = normaliseRole(rawRole);
    if (normalised && !roles.includes(normalised)) {
      roles.push(normalised);
    }
  }

  if (roles.length === 0) {
    throw new Error(`ADMIN_AUTH_USERS entry ${entry.id} did not include any valid roles`);
  }

  return {
    id: entry.id.trim(),
    name: entry.name.trim(),
    token: entry.token.trim(),
    roles,
  };
}

function parseUsers(raw: string | undefined): AdminUserRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RawUserConfig[] | null;
    if (!Array.isArray(parsed)) {
      throw new Error("ADMIN_AUTH_USERS must be a JSON array");
    }

    return parsed.map((entry) => parseUserConfig(entry));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("ADMIN_AUTH_USERS must be valid JSON");
    }

    throw error;
  }
}

export const getAdminUsers = cache(() => parseUsers(process.env.ADMIN_AUTH_USERS));

export function findUserById(id: string): AdminUserRecord | null {
  const users = getAdminUsers();
  return users.find((user) => user.id === id) ?? null;
}

export function findUserByToken(token: string): AdminUserRecord | null {
  const users = getAdminUsers();
  return users.find((user) => user.token === token) ?? null;
}
