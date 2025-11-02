"use client";

import AnalyticsConsentBanner from "@/components/analytics-consent-banner";
import { AnalyticsConsentProvider } from "@/components/analytics-consent-provider";
import { AnalyticsLoader } from "@/components/analytics-loader";
import AnalyticsPreferences from "@/components/analytics-preferences";
import BodyThemeSync from "@/components/body-theme-sync";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { useState, useRef } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const walletDemoEnabled = false;

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenSubmenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 300);
  };

  const handleConnectWallet = () => {
    if ((process.env.NEXT_PUBLIC_WALLET_MODE ?? "demo") === "demo") {
      router.push("/wallet-demo");
      return;
    }

    router.push("/contact?subject=wallet-onboarding");
  };

  return (
    <body className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <AnalyticsConsentProvider>
        <AnalyticsLoader />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BodyThemeSync />

          <div className="app-shell__affix">
            <header className="app-shell__header">
              <div className="l-container u-pad-block-sm">
                <nav className="app-nav" aria-label="Primary">
                <Link className="app-nav__brand" href="/">
                  <span className="app-nav__brand-text">Paula Livingstone</span>
                </Link>

                <ul className="app-nav__links">
                  <li className="app-nav__item">
                    <Link className="app-nav__link" href="/">
                      Home
                    </Link>
                  </li>
                  <li
                    className={`app-nav__item app-nav__item--has-submenu ${openSubmenu === 'writing' ? 'app-nav__item--open' : ''}`}
                    onMouseEnter={() => handleMouseEnter('writing')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      aria-haspopup="true"
                      className="app-nav__link"
                      href="/essays"
                    >
                      Writing
                    </Link>
                    <ul aria-label="Writing sections" className="app-nav__submenu">
                      <li>
                        <Link className="app-nav__sublink" href="/essays">
                          Essays
                        </Link>
                      </li>
                      <li>
                        <Link className="app-nav__sublink" href="/writing">
                          Blog
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
                  {walletDemoEnabled ? (
                    <li className="app-nav__item">
                      <Link className="app-nav__link" href="/wallet-demo">
                        Wallet demo
                      </Link>
                    </li>
                  ) : null}
                  <li
                    className={`app-nav__item app-nav__item--has-submenu ${openSubmenu === 'about' ? 'app-nav__item--open' : ''}`}
                    onMouseEnter={() => handleMouseEnter('about')}
                    onMouseLeave={handleMouseLeave}
                  >
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
                  <a className="app-nav__icon-link" href="https://x.com/palivula" aria-label="Paula on X">
                    <i className="fa-brands fa-x-twitter app-nav__icon" aria-hidden="true" />
                  </a>
                  <a
                    className="app-nav__icon-link"
                    href="https://www.linkedin.com/in/plivingstone"
                    aria-label="Paula on LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in app-nav__icon" aria-hidden="true" />
                  </a>
                  <a
                    className="app-nav__icon-link"
                    href="https://stackoverflow.com/users/4374150/paula-livingstone"
                    aria-label="Paula on Stack Overflow"
                  >
                    <i className="fa-brands fa-stack-overflow app-nav__icon" aria-hidden="true" />
                  </a>
                  <a className="app-nav__icon-link" href="https://github.com/pau1a" aria-label="Paula on GitHub">
                    <i className="fa-brands fa-github app-nav__icon" aria-hidden="true" />
                  </a>
                </div>
                </nav>
              </div>
            </header>
            <div className="app-subnav-band">
              <div className="app-subnav__container">
                <nav className="app-subnav" aria-label="Secondary">
                  <div className="app-subnav__brand">
                    <Link href="/" className="app-subnav__brand-link" aria-label="Paula Livingstone">
                      <Image
                        src="/media/logo-mark-white.svg"
                        alt=""
                        width={48}
                        height={48}
                        priority
                        style={{ height: "2.1rem", width: "auto" }}
                      />
                    </Link>
                  </div>
                  <form className="app-subnav__search" role="search" action="/search">
                    <label className="sr-only" htmlFor="app-subnav-search">
                      Search
                    </label>
                    <span className="app-subnav__search-icon" aria-hidden="true">
                      <i className="fa-solid fa-magnifying-glass" />
                    </span>
                    <input
                      className="app-subnav__search-input"
                      id="app-subnav-search"
                      name="q"
                      type="search"
                      placeholder="Search…"
                      autoComplete="off"
                    />
                  </form>
                  <button
                    type="button"
                    className="app-subnav__cta"
                    onClick={handleConnectWallet}
                  >
                    CONNECT WALLET
                  </button>
                </nav>
              </div>
            </div>
            {isAdminRoute ? (
              <div className="app-admin-band">
                <div className="app-admin-band__container l-container" id="app-admin-nav-slot" />
              </div>
            ) : null}
          </div>

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
