import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./footer.module.scss";

const SOCIAL_LINKS = [
  { href: "https://x.com/palivula", icon: "fa-x-twitter", label: "Paula on X" },
  { href: "https://www.linkedin.com/in/plivingstone", icon: "fa-linkedin-in", label: "Paula on LinkedIn" },
  {
    href: "https://stackoverflow.com/users/4374150/paula-livingstone",
    icon: "fa-stack-overflow",
    label: "Paula on Stack Overflow",
  },
  { href: "https://github.com/pau1a", icon: "fa-github", label: "Paula on GitHub" },
] as const;

type FooterProps = {
  children?: ReactNode;
};

export default function Footer({ children }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav aria-label="Secondary" className={styles.linkRow}>
          <Link className={styles.link} href="/now">
            Now
          </Link>
          <Link className={styles.link} href="/library">
            Library
          </Link>
          <Link className={styles.link} href="/philosophy">
            Philosophy
          </Link>
          <Link className={styles.link} href="/media">
            Media
          </Link>
          <Link className={styles.link} href="/rss.xml">
            RSS
          </Link>
          <Link className={styles.link} href="/privacy">
            Privacy
          </Link>
        </nav>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Paula Livingstone
        </p>
        <nav aria-label="Social media" className={styles.social}>
          {SOCIAL_LINKS.map(({ href, icon, label }) => (
            <a className={styles.socialLink} href={href} key={icon} aria-label={label}>
              <i className={`fa-brands ${icon} ${styles.socialIcon}`} aria-hidden="true" />
            </a>
          ))}
        </nav>
        {children ? <div className={styles.utility}>{children}</div> : null}
      </div>
    </footer>
  );
}
