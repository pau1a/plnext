// Demo/live behaviour: Renders the tip modal UI and dispatches demo submissions; live paths must be wired before enabling live mode.
"use client";

import styles from "./wallet-stub.module.scss";
import { useEffect, useRef, useCallback } from "react";

export interface TipFormValues {
  amount: number;
  token: string;
  chain: string;
  note?: string;
  postId: string;
}

interface TipModalProps {
  isOpen: boolean;
  address?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: TipFormValues) => Promise<void>;
  error?: string | null;
}

export function TipModal({
  isOpen,
  address,
  isSubmitting,
  onClose,
  onSubmit,
  error,
}: TipModalProps) {
  const amountRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      amountRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: TipFormValues = {
      amount: Number(formData.get("amount") ?? 0),
      token: String(formData.get("token") ?? "USDC"),
      chain: String(formData.get("chain") ?? "Arbitrum"),
      note: formData.get("note") ? String(formData.get("note")) : undefined,
      postId: String(formData.get("postId") ?? "wallet-demo"),
    };

    if (Number.isNaN(values.amount) || values.amount <= 0) {
      amountRef.current?.focus();
      return;
    }

    await onSubmit(values);
  };

  return (
    <div
      aria-modal="true"
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      ref={dialogRef}
      role="dialog"
      aria-label="Send a sandbox tip"
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Send sandbox tip</div>
          <p className={styles.modalSubtitle}>
            No wallet prompts fire in demo mode. Tips are stored locally with
            fake transaction hashes.
          </p>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="tip-amount">Amount</label>
            <input
              ref={amountRef}
              className={styles.input}
              id="tip-amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              placeholder="5"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="tip-token">Token</label>
            <select
              className={styles.select}
              defaultValue="USDC"
              id="tip-token"
              name="token"
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="tip-chain">Network</label>
            <select
              className={styles.select}
              defaultValue="Arbitrum"
              id="tip-chain"
              name="chain"
            >
              <option value="Arbitrum">Arbitrum</option>
              <option value="Base">Base</option>
              <option value="Ethereum">Ethereum</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="tip-post-id">Content / post ID</label>
            <input
              className={styles.input}
              defaultValue="wallet-demo"
              id="tip-post-id"
              name="postId"
              placeholder="post-slug"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="tip-note">Note (optional)</label>
            <textarea
              className={styles.textarea}
              id="tip-note"
              name="note"
              placeholder="Thanks for publishing the deep-dive!"
            />
          </div>

          <div aria-live="polite">
            {address ? (
              <p className={styles.subtext}>
                Sending from <strong>{address}</strong>
              </p>
            ) : (
              <p className={styles.subtext}>Connect to generate a sandbox address.</p>
            )}
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}

          <div className={styles.modalActions}>
            <button
              className={styles.buttonSecondary}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.buttonPrimary}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Sending…" : "Send demo tip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
