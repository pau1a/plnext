import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./footer.module.scss";

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
        {children ? <div className={styles.utility}>{children}</div> : null}
      </div>
    </footer>
  );
}
