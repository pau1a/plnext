export type Role = "admin" | "moderator" | "viewer";

export type Permission =
  | "comments:view"
  | "comments:moderate"
  | "audit:read";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ["comments:view", "comments:moderate", "audit:read"],
  moderator: ["comments:view", "comments:moderate"],
  viewer: ["comments:view"],
};

export interface AuthenticatedActor {
  id: string;
  name: string;
  roles: Role[];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function actorHasPermission(actor: AuthenticatedActor, permission: Permission): boolean {
  return actor.roles.some((role) => roleHasPermission(role, permission));
}

export function actorHasRole(actor: AuthenticatedActor, role: Role): boolean {
  return actor.roles.includes(role);
}

export function describePermission(permission: Permission): string {
  switch (permission) {
    case "comments:view":
      return "view moderation queues";
    case "comments:moderate":
      return "moderate comments";
    case "audit:read":
      return "review moderation audit logs";
    default:
      return permission;
  }
}
