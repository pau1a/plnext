"use client";

import BootstrapClient from "@/components/bootstrap-client";
import BodyThemeSync from "@/components/body-theme-sync";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <body className="bg-body text-body">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BodyThemeSync />
        <BootstrapClient />
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" href="/">
              <i className="fa-solid fa-shield-halved me-2" />
              Paula Livingstone
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="nav">
              <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
                <li className="nav-item"><Link className="nav-link" href="/about">About</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/projects">Projects</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/blog">Blog</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/contact">Contact</Link></li>
                <li className="nav-item mt-3 mt-lg-0">
                  <ThemeToggle />
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="container py-4">{children}</main>

        <footer className="text-center text-muted py-4">
          <small><i className="fa-regular fa-copyright me-1" />{new Date().getFullYear()} Paula Livingstone</small>
        </footer>
      </ThemeProvider>
    </body>
  );
}
