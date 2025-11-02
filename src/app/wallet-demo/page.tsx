// Demo/live behaviour: Exposes the wallet stub in a standalone page; swap to live once providers and endpoints are implemented.
import PageShell from "@/components/layout/PageShell";
import { WalletStub } from "@/components/WalletStub";
import type { Metadata } from "next";
import Link from "next/link";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Wallet Demo | Paula Livingstone",
  description:
    "Demo-first wallet experience showing sandbox tips, integrity verification, and humanity attest flows without touching mainnet.",
  alternates: { canonical: "/wallet-demo" },
};

export default function WalletDemoPage() {
  return (
    <PageShell as="main" className={styles.page} outerClassName={styles.shell}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Feature-flagged sandbox</p>
        <h1 className={styles.title}>Wallet demo experience</h1>
        <p className={styles.summary}>
          Connect to a pseudo address, send mock tips, verify integrity, and
          simulate humanity attestations. All interactions stay local while{" "}
          <code>NEXT_PUBLIC_WALLET_MODE</code> remains <code>demo</code>.
        </p>
      </header>

      <WalletStub />

      <aside className={styles.aside}>
        <span>
          Flip instructions live in the{" "}
          <Link href="/docs">README &amp; docs</Link>. When ready for production,
          wire the SIWE, tips, integrity, and humanity APIs, deploy the{" "}
          <code>PostRegistry</code> contract, then set{" "}
          <code>NEXT_PUBLIC_WALLET_MODE=live</code>.
        </span>
        <span>
          Storage guarantees and security posture are documented on{" "}
          <Link href="/proofs-privacy">Proofs &amp; Privacy</Link>.
        </span>
      </aside>
    </PageShell>
  );
}
