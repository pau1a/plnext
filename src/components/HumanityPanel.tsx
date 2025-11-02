// Demo/live behaviour: Provides humanity attestation UI calling mocked demo endpoint; live mode must wire to WebAuthn + staking services.
"use client";

import { useCallback, useMemo, useState } from "react";
import type { HumanityAttestResponse } from "@/types/wallet-demo";

import styles from "./wallet-stub.module.scss";

interface HumanityPanelProps {
  address?: string;
  isDemoMode: boolean;
}

export function HumanityPanel({ address, isDemoMode }: HumanityPanelProps) {
  const [score, setScore] = useState(40);
  const [attestationCount, setAttestationCount] = useState(0);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const badgeCopy = useMemo(() => {
    if (score >= 70) {
      return "Sybil-resistant";
    }
    if (score >= 50) {
      return "Human leaning";
    }
    return "Low assurance";
  }, [score]);

  const handleToggleReceipt = useCallback(() => {
    setShowReceipt((value) => !value);
  }, []);

  const handleAttest = async () => {
    setError(null);

    if (!address) {
      setError("Connect the sandbox wallet to attest.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isDemoMode) {
        throw new Error(
          "Live humanity attest flow pending. Wire /api/humanity/* endpoints before enabling live mode.",
        );
      }

      const response = await fetch("/api/demo/humanity/attest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          attestation: "github",
        }),
      });

      if (!response.ok) {
        throw new Error("Demo humanity service returned an error.");
      }

      const payload = (await response.json()) as HumanityAttestResponse;
      setScore(payload.score);
      setAttestationCount(payload.attestationCount);
      setReceipt(payload.receipt);
      setShowReceipt(true);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to record attestation.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleHeading}>
        <span>Humanity</span>
        <span className={styles.moduleBadge}>{badgeCopy}</span>
      </div>
      <div className={styles.humanityScore} aria-live="polite">
        {score}
      </div>
      <p className={styles.subtext}>
        Attestations simulate passkey proofs. Live mode should plug into your
        WebAuthn registrar and staking ledger.
      </p>
      <div className={styles.actions}>
        <button
          className={styles.buttonSecondary}
          disabled={isSubmitting}
          onClick={handleAttest}
          type="button"
        >
          <i className="fa-solid fa-user-shield" aria-hidden="true" />
          Demo attest
        </button>
        {receipt ? (
          <button
            className={styles.buttonSecondary}
            onClick={handleToggleReceipt}
            type="button"
          >
            <i className="fa-solid fa-file-export" aria-hidden="true" />
            {showReceipt ? "Hide receipt" : "Receipt"}
          </button>
        ) : null}
      </div>
      <p className={styles.subtext} aria-live="polite">
        Attestations: {attestationCount}
      </p>
      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}
      {showReceipt && receipt ? (
        <div className={styles.receipt} role="region" aria-label="Demo receipt">
          <pre>{JSON.stringify(receipt, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
