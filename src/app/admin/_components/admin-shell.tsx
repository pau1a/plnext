import Link from "next/link";

import { actorHasPermission, type AuthenticatedActor } from "@/lib/auth/rbac";

import { LogoutButton } from "./logout-button";

interface AdminShellProps {
  actor: AuthenticatedActor;
  title: string;
  children: React.ReactNode;
}

export function AdminShell({ actor, title, children }: AdminShellProps) {
  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    ...(actorHasPermission(actor, "audit:read")
      ? [{ href: "/admin/essays", label: "Essays" } as const]
      : []),
    ...(actorHasPermission(actor, "comments:moderate")
      ? [{ href: "/admin/comments", label: "Comment moderation" } as const]
      : []),
  ];

  return (
    <div className="u-stack u-gap-xl">
      <header className="u-flex u-items-center u-justify-between">
        <div>
          <p className="u-text-sm u-text-muted">Signed in as {actor.name}</p>
          <h1 className="u-heading-lg u-font-semibold">{title}</h1>
        </div>
        <LogoutButton />
      </header>

      <nav aria-label="Admin navigation" className="u-flex u-gap-md">
        {navLinks.map((link) => (
          <Link className="button button--ghost" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <main className="u-stack u-gap-xl">{children}</main>
    </div>
  );
}
