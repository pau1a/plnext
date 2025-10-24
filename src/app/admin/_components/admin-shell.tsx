"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { actorHasPermission, type AuthenticatedActor } from "@/lib/auth/rbac";

import { LogoutButton } from "./logout-button";

interface AdminShellProps {
  actor: AuthenticatedActor;
  title: string;
  children: React.ReactNode;
}

export function AdminShell({ actor, title, children }: AdminShellProps) {
  const [isContentMenuOpen, setContentMenuOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const trigger = group.querySelector<HTMLButtonElement>("[data-admin-nav-trigger]");
    const menu = group.querySelector<HTMLUListElement>("[data-admin-nav-menu]");
    if (!trigger || !menu) {
      return;
    }

    const toggleMenu = () => setContentMenuOpen((prev) => !prev);
    const handleDocumentClick = (event: MouseEvent) => {
      if (!group.contains(event.target as Node)) {
        setContentMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContentMenuOpen(false);
      }
    };

    trigger.addEventListener("click", toggleMenu);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      trigger.removeEventListener("click", toggleMenu);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const trigger = group.querySelector<HTMLButtonElement>("[data-admin-nav-trigger]");
    const menu = group.querySelector<HTMLUListElement>("[data-admin-nav-menu]");
    if (!trigger || !menu) {
      return;
    }

    const state = isContentMenuOpen ? "true" : "false";
    group.dataset.open = state;
    menu.dataset.open = state;
    trigger.setAttribute("aria-expanded", state);
  }, [isContentMenuOpen]);

  const showContentMenu = actorHasPermission(actor, "audit:read");
  const showComments = actorHasPermission(actor, "comments:moderate");

  return (
    <div className="u-stack u-gap-xl">
      <header className="u-flex u-items-center u-justify-between">
        <div>
          <p className="u-text-sm u-text-muted">Signed in as {actor.name}</p>
          <h1 className="u-heading-lg u-font-semibold">{title}</h1>
        </div>
        <LogoutButton />
      </header>

      <nav aria-label="Admin navigation" className="admin-nav">
        <Link className="admin-nav__link" href="/admin">
          Dashboard
        </Link>

        {showContentMenu ? (
          <div
            className="admin-nav__group"
            data-admin-nav-group
            data-open={isContentMenuOpen ? "true" : "false"}
            ref={groupRef}
          >
            <button
              type="button"
              className="admin-nav__link admin-nav__link--with-carat"
              data-admin-nav-trigger
              aria-haspopup="true"
              aria-expanded={isContentMenuOpen}
            >
              Site content
            </button>
            <ul
              className="admin-nav__submenu"
              data-admin-nav-menu
              data-open={isContentMenuOpen ? "true" : "false"}
            >
              <li>
                <Link className="admin-nav__sublink" href="/admin/essays">
                  Essays
                </Link>
              </li>
              <li>
                <Link className="admin-nav__sublink" href="/admin/blog">
                  Blog posts
                </Link>
              </li>
            </ul>
          </div>
        ) : null}

        {showComments ? (
          <Link className="admin-nav__link" href="/admin/comments">
            Comment moderation
          </Link>
        ) : null}
      </nav>

      <main className="u-stack u-gap-xl">{children}</main>
    </div>
  );
}
