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
import { useCallback, useEffect, useRef, useState } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubnavHidden, setIsSubnavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const mainNavRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const subnavRef = useRef<HTMLDivElement | null>(null);

  const walletDemoEnabled = false;

  const closeMobileNav = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsMobileNavOpen(false);
    setOpenSubmenu(null);
  }, []);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenSubmenu(menu);
  };

  const handleMouseLeave = () => {
    if (isMobileNavOpen) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 300);
  };

  const toggleSubmenu = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setOpenSubmenu((current) => (current === menu ? null : menu));
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen((prev) => {
      const next = !prev;

      if (!next) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setOpenSubmenu(null);
      }

      return next;
    });
  };

  const handleConnectWallet = () => {
    closeMobileNav();

    if ((process.env.NEXT_PUBLIC_WALLET_MODE ?? "demo") === "demo") {
      router.push("/wallet-demo");
      return;
    }

    router.push("/contact?subject=wallet-onboarding");
  };

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileNav]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    lastScrollY.current = window.scrollY;

    const SCROLL_THRESHOLD = 15;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < SCROLL_THRESHOLD) {
        return;
      }

      if (currentY <= 0) {
        lastDirection.current = "up";
        lastScrollY.current = 0;
        setIsSubnavHidden(false);
        return;
      }

      const mainNavBottom = mainNavRef.current?.getBoundingClientRect().bottom ?? 0;
      const subnavBottom = subnavRef.current?.getBoundingClientRect().bottom ?? mainNavBottom;
      const navStackBottom = Math.max(mainNavBottom, subnavBottom);
      const mainTop = mainRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const hasClearedNavStack = mainTop <= navStackBottom;

      if (!hasClearedNavStack) {
        lastDirection.current = "up";
        lastScrollY.current = currentY;
        setIsSubnavHidden(false);
        return;
      }

      const direction = delta > 0 ? "down" : "up";

      if (direction !== lastDirection.current) {
        lastDirection.current = direction;
      }

      lastScrollY.current = currentY;
      setIsSubnavHidden(direction === "down");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
            <header className="app-shell__header" ref={mainNavRef}>
              <div className="l-container u-pad-block-sm">
                <nav
                  className={`app-nav ${isMobileNavOpen ? "app-nav--open" : ""}`}
                  aria-label="Primary"
                >
                  <div className="app-nav__top">
                    <Link className="app-nav__brand" href="/" onClick={closeMobileNav}>
                      <span className="app-nav__brand-text">Paula Livingstone</span>
                    </Link>
                    <button
                      type="button"
                      className="app-nav__menu-toggle"
                      aria-expanded={isMobileNavOpen}
                      aria-controls="app-nav-primary-links"
                      onClick={handleToggleMobileNav}
                    >
                      <span className="sr-only">
                        {isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                      </span>
                      <i
                        className={`fa-solid ${isMobileNavOpen ? "fa-xmark" : "fa-bars"} app-nav__menu-toggle-icon`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <ul className="app-nav__links" id="app-nav-primary-links">
                    <li className="app-nav__item">
                      <Link className="app-nav__link" href="/" onClick={closeMobileNav}>
                        Home
                      </Link>
                    </li>
                    <li
                      className={`app-nav__item app-nav__item--has-submenu ${openSubmenu === 'writing' ? 'app-nav__item--open' : ''}`}
                      onMouseEnter={() => handleMouseEnter('writing')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="app-nav__trigger">
                        <Link
                          aria-haspopup="true"
                          className="app-nav__link"
                          href="/essays"
                          onClick={closeMobileNav}
                        >
                          Writing
                        </Link>
                        <button
                          type="button"
                          className="app-nav__submenu-toggle"
                          aria-expanded={openSubmenu === "writing"}
                          aria-controls="app-nav-submenu-writing"
                          onClick={() => toggleSubmenu("writing")}
                        >
                          <span className="sr-only">Toggle Writing menu</span>
                          <i className="fa-solid fa-chevron-down app-nav__submenu-toggle-icon" aria-hidden="true" />
                        </button>
                      </div>
                      <ul
                        aria-label="Writing sections"
                        className="app-nav__submenu"
                        id="app-nav-submenu-writing"
                      >
                        <li>
                          <Link className="app-nav__sublink" href="/essays" onClick={closeMobileNav}>
                            Essays
                          </Link>
                        </li>
                        <li>
                          <Link className="app-nav__sublink" href="/writing" onClick={closeMobileNav}>
                            Blog
                          </Link>
                        </li>
                        <li>
                          <Link className="app-nav__sublink" href="/notes" onClick={closeMobileNav}>
                            Notes
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="app-nav__item">
                      <Link className="app-nav__link" href="/projects" onClick={closeMobileNav}>
                        Projects
                      </Link>
                    </li>
                    {walletDemoEnabled ? (
                      <li className="app-nav__item">
                        <Link className="app-nav__link" href="/wallet-demo" onClick={closeMobileNav}>
                          Wallet demo
                        </Link>
                      </li>
                    ) : null}
                    <li
                      className={`app-nav__item app-nav__item--has-submenu ${openSubmenu === 'about' ? 'app-nav__item--open' : ''}`}
                      onMouseEnter={() => handleMouseEnter('about')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="app-nav__trigger">
                        <Link
                          aria-haspopup="true"
                          className="app-nav__link"
                          href="/about"
                          onClick={closeMobileNav}
                        >
                          About
                        </Link>
                        <button
                          type="button"
                          className="app-nav__submenu-toggle"
                          aria-expanded={openSubmenu === "about"}
                          aria-controls="app-nav-submenu-about"
                          onClick={() => toggleSubmenu("about")}
                        >
                          <span className="sr-only">Toggle About menu</span>
                          <i className="fa-solid fa-chevron-down app-nav__submenu-toggle-icon" aria-hidden="true" />
                        </button>
                      </div>
                      <ul
                        aria-label="About sections"
                        className="app-nav__submenu"
                        id="app-nav-submenu-about"
                      >
                        <li>
                          <Link className="app-nav__sublink" href="/about" onClick={closeMobileNav}>
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="app-nav__sublink" href="/stream" onClick={closeMobileNav}>
                            Stream
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="app-nav__item">
                      <Link className="app-nav__link" href="/contact" onClick={closeMobileNav}>
                        Contact
                      </Link>
                    </li>
                  </ul>

                <div className="app-nav__actions">
                  <ThemeToggle />
                  <a
                    className="app-nav__icon-link"
                    href="https://x.com/palivula"
                    aria-label="Paula on X"
                    onClick={closeMobileNav}
                  >
                    <i className="fa-brands fa-x-twitter app-nav__icon" aria-hidden="true" />
                  </a>
                  <a
                    className="app-nav__icon-link"
                    href="https://www.linkedin.com/in/plivingstone"
                    aria-label="Paula on LinkedIn"
                    onClick={closeMobileNav}
                  >
                    <i className="fa-brands fa-linkedin-in app-nav__icon" aria-hidden="true" />
                  </a>
                  <a
                    className="app-nav__icon-link"
                    href="https://stackoverflow.com/users/4374150/paula-livingstone"
                    aria-label="Paula on Stack Overflow"
                    onClick={closeMobileNav}
                  >
                    <i className="fa-brands fa-stack-overflow app-nav__icon" aria-hidden="true" />
                  </a>
                  <a
                    className="app-nav__icon-link"
                    href="https://github.com/pau1a"
                    aria-label="Paula on GitHub"
                    onClick={closeMobileNav}
                  >
                    <i className="fa-brands fa-github app-nav__icon" aria-hidden="true" />
                  </a>
                </div>
                </nav>
              </div>
            </header>
            <div
              className={`app-subnav-band ${isSubnavHidden ? "subnav--hidden" : ""}`}
              ref={subnavRef}
            >
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

          <main className="app-shell__main" id="main-content" tabIndex={-1} ref={mainRef}>
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
