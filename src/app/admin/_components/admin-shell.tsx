"use client";

import clsx from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { actorHasPermission, type AuthenticatedActor } from "@/lib/auth/rbac";

import { LogoutButton } from "./logout-button";

interface AdminShellProps {
  actor: AuthenticatedActor;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({ actor, title, subtitle, children, className }: AdminShellProps) {
  const [navSlot, setNavSlot] = useState<HTMLElement | null>(null);
  const [isContentMenuOpen, setContentMenuOpen] = useState(false);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);

  const clearScheduledMenuClose = useCallback(() => {
    if (closeMenuTimeoutRef.current !== null) {
      window.clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
  }, []);

  const scheduleMenuClose = useCallback(() => {
    clearScheduledMenuClose();
    closeMenuTimeoutRef.current = window.setTimeout(() => {
      setContentMenuOpen(false);
      closeMenuTimeoutRef.current = null;
    }, 120);
  }, [clearScheduledMenuClose]);

  useEffect(() => {
    setNavSlot(document.getElementById("app-admin-nav-slot"));
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!groupRef.current?.contains(event.target as Node)) {
        clearScheduledMenuClose();
        setContentMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearScheduledMenuClose();
        setContentMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [clearScheduledMenuClose]);

  useEffect(() => {
    return () => {
      clearScheduledMenuClose();
    };
  }, [clearScheduledMenuClose]);

  const showContentMenu = actorHasPermission(actor, "audit:read");
  const showComments = actorHasPermission(actor, "comments:moderate");

  const adminNav =
    navSlot && (showContentMenu || showComments)
      ? createPortal(
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
                onMouseEnter={() => {
                  clearScheduledMenuClose();
                  setContentMenuOpen(true);
                }}
                onMouseLeave={scheduleMenuClose}
              >
                <button
                  type="button"
                  className="admin-nav__link admin-nav__link--with-carat"
                  data-admin-nav-trigger
                  aria-haspopup="true"
                  aria-expanded={isContentMenuOpen}
                  onClick={() => {
                    clearScheduledMenuClose();
                    setContentMenuOpen((prev) => !prev);
                  }}
                  onFocus={() => {
                    clearScheduledMenuClose();
                    setContentMenuOpen(true);
                  }}
                >
                  Site content
                </button>
                <ul
                  className="admin-nav__submenu"
                  data-admin-nav-menu
                  data-open={isContentMenuOpen ? "true" : "false"}
                >
                  <li>
                    <Link
                      className="admin-nav__sublink"
                      href="/admin/essays"
                      onClick={() => {
                        clearScheduledMenuClose();
                        setContentMenuOpen(false);
                      }}
                    >
                      Essays
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="admin-nav__sublink"
                      href="/admin/blog"
                      onClick={() => {
                        clearScheduledMenuClose();
                        setContentMenuOpen(false);
                      }}
                    >
                      Blog posts
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="admin-nav__sublink"
                      href="/admin/notes"
                      onClick={() => {
                        clearScheduledMenuClose();
                        setContentMenuOpen(false);
                      }}
                    >
                      Notes
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="admin-nav__sublink"
                      href="/admin/projects"
                      onClick={() => {
                        clearScheduledMenuClose();
                        setContentMenuOpen(false);
                      }}
                    >
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="admin-nav__sublink"
                      href="/admin/stream"
                      onClick={() => {
                        clearScheduledMenuClose();
                        setContentMenuOpen(false);
                      }}
                    >
                      Stream
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
          </nav>,
          navSlot,
        )
      : null;

  return (
    <>
      {adminNav}
      <div className={clsx("u-stack u-gap-xl", className)}>
        <header className="admin-shell__header">
          <div className="admin-shell__heading">
            <div className="admin-shell__meta">
              <span className="admin-shell__meta-item">Signed in as {actor.name}</span>
            </div>
            <h1 className="admin-shell__title u-heading-lg u-font-semibold">
              {title}
              {subtitle ? <span className="admin-shell__title-suffix">— {subtitle}</span> : null}
            </h1>
          </div>
          <LogoutButton />
        </header>
        <section className="u-stack u-gap-xl">{children}</section>
      </div>
    </>
  );
}
