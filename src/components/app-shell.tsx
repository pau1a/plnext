"use client";

import AnalyticsConsentBanner from "@/components/analytics-consent-banner";
import { AnalyticsConsentProvider } from "@/components/analytics-consent-provider";
import AnalyticsPreferences from "@/components/analytics-preferences";
import BodyThemeSync from "@/components/body-theme-sync";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <body className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <AnalyticsConsentProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BodyThemeSync />

          <header className="app-shell__header">
            <div className="l-container u-pad-block-lg">
              <nav className="app-nav" aria-label="Primary">
                <Link className="app-nav__brand" href="/">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                  <span>Paula Livingstone</span>
                </Link>

                <ul className="app-nav__links">
                  <li className="app-nav__item">
                    <Link className="app-nav__link" href="/">
                      Home
                    </Link>
                  </li>
                  <li className="app-nav__item app-nav__item--has-submenu">
                    <Link
                      aria-haspopup="true"
                      className="app-nav__link"
                      href="/writing"
                    >
                      Writing
                    </Link>
                    <ul aria-label="Writing sections" className="app-nav__submenu">
                      <li>
                        <Link className="app-nav__sublink" href="/writing">
                          Essays
                        </Link>
                      </li>
                      <li>
                        <Link className="app-nav__sublink" href="/notes">
                          Notes
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="app-nav__item">
                    <Link className="app-nav__link" href="/projects">
                      Projects
                    </Link>
                  </li>
                  <li className="app-nav__item app-nav__item--has-submenu">
                    <Link
                      aria-haspopup="true"
                      className="app-nav__link"
                      href="/about"
                    >
                      About
                    </Link>
                    <ul aria-label="About sections" className="app-nav__submenu">
                      <li>
                        <Link className="app-nav__sublink" href="/about">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="app-nav__sublink" href="/stream">
                          Stream
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="app-nav__item">
                    <Link className="app-nav__link" href="/contact">
                      Contact
                    </Link>
                  </li>
                </ul>

                <div className="app-nav__actions">
                  <ThemeToggle />
                </div>
              </nav>
            </div>
          </header>

          <main className="app-shell__main" id="main-content" tabIndex={-1}>
            {children}
          </main>

          <Footer>
            <AnalyticsPreferences />
          </Footer>

          <AnalyticsConsentBanner />
        </ThemeProvider>
      </AnalyticsConsentProvider>
    </body>
  );
}
