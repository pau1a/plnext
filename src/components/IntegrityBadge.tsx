// Demo/live behaviour: Surfaces integrity verification UI, calling mocked demo endpoint while live mode awaits real provider wiring.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./wallet-stub.module.scss";

interface IntegrityBadgeProps {
  postId: string;
  isDemoMode: boolean;
}

interface IntegrityResult {
  verified: boolean;
  hash: string;
  method: string;
  notes?: string;
}

type IntegrityStatus = "idle" | "loading" | "verified" | "error";

export function IntegrityBadge({ postId, isDemoMode }: IntegrityBadgeProps) {
  const [status, setStatus] = useState<IntegrityStatus>("idle");
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const label = useMemo(() => {
    switch (status) {
      case "verified":
        return "Verified (demo)";
      case "loading":
        return "Verifying…";
      case "error":
        return "Verification failed";
      default:
        return "Not verified";
    }
  }, [status]);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  useEffect(() => {
    if (!showDetails) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetails, closeDetails]);

  const handleVerify = async () => {
    setStatus("loading");
    setError(null);

    try {
      if (!isDemoMode) {
        throw new Error(
          "Live integrity verification is not ready. Wire /api/integrity/verify before enabling live mode.",
        );
      }

      const response = await fetch(
        `/api/demo/integrity/verify?postId=${encodeURIComponent(postId)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Demo integrity service returned an error.");
      }

      const payload = (await response.json()) as IntegrityResult;
      setResult(payload);
      setStatus(payload.verified ? "verified" : "error");
    } catch (verificationError) {
      const message =
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify integrity.";
      setError(message);
      setResult(null);
      setStatus("error");
    } finally {
      setShowDetails(true);
    }
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleHeading}>
        <span>Integrity</span>
        <span className={styles.moduleBadge}>{label}</span>
      </div>
      <p className={styles.subtext}>
        Anchor proofs stay local in demo. Connect to live infra before flipping
        the feature flag.
      </p>
      <div className={styles.actions}>
        <button
          className={styles.buttonSecondary}
          disabled={status === "loading"}
          onClick={handleVerify}
          type="button"
        >
          <i className="fa-solid fa-shield-halved" aria-hidden="true" />
          Verify proof
        </button>
      </div>

      {showDetails ? (
        <div
          aria-modal="true"
          className={styles.modalBackdrop}
          role="dialog"
          aria-label="Integrity verification details"
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Integrity details</div>
              <p className={styles.modalSubtitle}>
                Demo mode returns deterministic proofs. Wire to on-chain
                validators before going live.
              </p>
            </div>
            {status === "loading" ? (
              <p className={styles.subtext}>Verifying proof…</p>
            ) : null}
            {status === "error" && error ? (
              <div className={styles.error} role="alert">
                {error}
              </div>
            ) : null}
            {status === "verified" && result ? (
              <div>
                <div className={styles.badgeVerified}>
                  <i className="fa-solid fa-circle-check" aria-hidden="true" />
                  Verified in sandbox
                </div>
                <dl>
                  <dt className={styles.subtext}>Method</dt>
                  <dd className={styles.addressValue}>{result.method}</dd>
                  <dt className={styles.subtext}>Hash</dt>
                  <dd className={styles.addressValue}>{result.hash}</dd>
                </dl>
              </div>
            ) : null}
            <div className={styles.modalActions}>
              <button
                className={styles.buttonSecondary}
                onClick={closeDetails}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
