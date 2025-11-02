// Demo/live behaviour: Documents demo storage versus live commitments so teams can audit before flipping modes.
import PageShell from "@/components/layout/PageShell";
import type { Metadata } from "next";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Proofs & Privacy | Paula Livingstone",
  description:
    "Storage notes for the wallet demo: what persists locally, what the mocked APIs keep, and how the live launch will change handling.",
  alternates: { canonical: "/proofs-privacy" },
};

export const dynamic = "force-static";

const demoStorage = [
  "Session storage key `wallet-demo-address` keeps the pseudo address only for the current tab; clearing the session or switching to live removes it.",
  "Demo tips land in `/api/demo/tips/record`, remain in-process memory only, and each record is tagged `demo: true` before being discarded on redeploy.",
  "Humanity attestations increment an in-memory counter; no identifiers persist beyond the running server instance.",
  "Integrity verification hashes derive deterministically from the post id and never leave the demo environment.",
];

const liveAdjustments = [
  "Replace the pseudo connect flow with viem or ethers and gate live requests through `/api/siwe/verify`.",
  "Persist validated tips with signature or relayer receipts in your production datastore, separating demo data paths.",
  "Anchor content hashes on-chain via `contracts/PostRegistry.sol` and expose the resulting tx hashes through `/api/integrity/anchor`.",
  "Back humanity attestations with WebAuthn credentials and optional staking ledgers, returning verifiable receipts from `/api/humanity/*`.",
];

const securityNotes = [
  "No private keys are accepted or generated in demo mode.",
  "Rate limiting guards `/api/demo/*` so the sandbox cannot be abused for amplification attacks.",
  "Always review for stray `eth_sendTransaction` or `personal_sign` calls when flipping to live.",
  "Log real transaction hashes only when the feature flag is set to `live`, and label demo telemetry explicitly.",
];

export default function ProofsPrivacyPage() {
  return (
    <PageShell as="main" className={styles.page} outerClassName={styles.layout}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Wallet assurances</p>
        <h1 className={styles.heroTitle}>Proofs &amp; privacy</h1>
        <p className={styles.heroSummary}>
          Exactly what the demo wallet stores today, what flips once live mode
          is enabled, and how to request updates or deletion.
        </p>
      </section>

      <section className={styles.body}>
        <article className={styles.section}>
          <h2 className={styles.sectionTitle}>Sandbox storage</h2>
          <p className={styles.sectionText}>
            Demo mode keeps data intentionally transient. Nothing leaves the
            browser session or the running server process.
          </p>
          <ul className={styles.list}>
            {demoStorage.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.section}>
          <h2 className={styles.sectionTitle}>Preparing for live mode</h2>
          <p className={styles.sectionText}>
            When `NEXT_PUBLIC_WALLET_MODE` switches to `live`, replace each demo
            placeholder with your production infrastructure.
          </p>
          <ul className={styles.list}>
            {liveAdjustments.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.section}>
          <h2 className={styles.sectionTitle}>Security posture</h2>
          <p className={styles.sectionText}>
            The demo layers err on the side of failing closed. Carry the same
            assumptions into production and extend them where required.
          </p>
          <ul className={styles.list}>
            {securityNotes.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.section}>
          <h2 className={styles.sectionTitle}>Questions &amp; removal</h2>
          <p className={styles.sectionText}>
            For changes to this policy or data removal in live mode, e-mail
            privacy@paulalivingstone.com. Include the wallet address, proof of
            control, and reference hashes; responses arrive within five business
            days.
          </p>
          <p className={styles.footnote}>
            Last reviewed {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            .
          </p>
        </article>
      </section>
    </PageShell>
  );
}
