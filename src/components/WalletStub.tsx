// Demo/live behaviour: Feature-flagged wallet stub that drives sandbox UI flows; live paths throw until real providers replace the demo implementations.
"use client";

import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type {
  DemoTipPayload,
  DemoTipRecord,
  DemoTipResponse,
  WalletMode,
} from "@/types/wallet-demo";

import styles from "./wallet-stub.module.scss";
import { TipModal, type TipFormValues } from "./TipModal";
import { IntegrityBadge } from "./IntegrityBadge";
import { HumanityPanel } from "./HumanityPanel";

const WALLET_MODE = process.env.NEXT_PUBLIC_WALLET_MODE ?? "demo";
const SESSION_ADDRESS_KEY = "wallet-demo-address";
const SESSION_TIPS_KEY = "wallet-demo-tips";

const isDemoMode = (WALLET_MODE as WalletMode) === "demo";

function generateHexString(bytes: number) {
  const buffer = new Uint8Array(bytes);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(buffer);
  } else {
    for (let index = 0; index < buffer.length; index += 1) {
      buffer[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(buffer, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

function generateDemoAddress() {
  return `0x${generateHexString(20)}`;
}

function generateFakeTxHash() {
  return `0x${generateHexString(32)}`;
}

function persistSessionState(address: string | undefined, tips: DemoTipRecord[]) {
  if (typeof window === "undefined" || !isDemoMode) {
    return;
  }

  if (address) {
    window.sessionStorage.setItem(SESSION_ADDRESS_KEY, address);
  }
  window.sessionStorage.setItem(SESSION_TIPS_KEY, JSON.stringify(tips));
}

const initialDemoTips = (): DemoTipRecord[] => {
  if (typeof window === "undefined" || !isDemoMode) {
    return [];
  }

  const storedTips = window.sessionStorage.getItem(SESSION_TIPS_KEY);
  if (!storedTips) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedTips) as DemoTipRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((entry) => ({
      ...entry,
      demo: true,
    }));
  } catch {
    return [];
  }
};

export function WalletStub() {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [tips, setTips] = useState<DemoTipRecord[]>(initialDemoTips);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [isSubmittingTip, setIsSubmittingTip] = useState(false);
  const [tipError, setTipError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !isDemoMode) {
      return;
    }
    const storedAddress = window.sessionStorage.getItem(SESSION_ADDRESS_KEY);
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  useEffect(() => {
    persistSessionState(address, tips);
  }, [address, tips]);

  const isConnected = Boolean(address);

  const walletModeCopy = isDemoMode ? "Sandbox session" : "Live mode";

  const handleConnect = useCallback(async () => {
    setConnectError(null);
    setConnecting(true);
    try {
      if (!isDemoMode) {
        const message =
          "Live wallet connect is not wired. Replace pretendConnect with viem before enabling live mode.";
        setConnectError(message);
        throw new Error(message);
      }

      if (typeof window === "undefined") {
        throw new Error("Wallet connect can only run in the browser.");
      }

      const existing = window.sessionStorage.getItem(SESSION_ADDRESS_KEY);
      const nextAddress = existing ?? generateDemoAddress();
      if (!existing) {
        window.sessionStorage.setItem(SESSION_ADDRESS_KEY, nextAddress);
      }

      setAddress(nextAddress);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to connect wallet.";
      setConnectError(message);
      console.error(error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!isDemoMode) {
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_ADDRESS_KEY);
    }
    setAddress(undefined);
  }, []);

  const handleSubmitTip = useCallback(
    async (values: TipFormValues) => {
      setTipError(null);

      if (!isDemoMode) {
        const message =
          "Live tip flow not connected. Replace fakeSendTip with live intent or on-chain transaction.";
        setTipError(message);
        throw new Error(message);
      }

      if (!address) {
        const message = "Connect the sandbox wallet before tipping.";
        setTipError(message);
        return;
      }

      setIsSubmittingTip(true);
      try {
        const payload: DemoTipPayload = {
          ...values,
          address,
          ts: new Date().toISOString(),
        };

        const response = await fetch("/api/demo/tips/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Demo tip service returned an error.");
        }

        const data = (await response.json()) as DemoTipResponse;
        const record: DemoTipRecord = {
          ...data.record,
          txHash: data.txHash ?? generateFakeTxHash(),
        };

        setTips((previous) => {
          const next = [record, ...previous];
          return next.slice(0, 8);
        });
        setTipModalOpen(false);
      } catch (submissionError) {
        const message =
          submissionError instanceof Error
            ? submissionError.message
            : "Failed to record demo tip.";
        setTipError(message);
        console.error(submissionError);
      } finally {
        setIsSubmittingTip(false);
      }
    },
    [address],
  );

  const recentTips = tips;

  return (
    <section
      aria-labelledby="wallet-demo-heading"
      className={clsx(styles.wallet, "wallet-demo")}
    >
      <header className={styles.header}>
        <span className={styles.eyebrow}>Wallet sandbox</span>
        <div className={styles.titleRow}>
          <h2 className={styles.title} id="wallet-demo-heading">
            Tip jar, integrity, humanity
          </h2>
          <span className={styles.modeBadge}>
            <i className="fa-solid fa-flask" aria-hidden="true" />
            {walletModeCopy}
          </span>
        </div>
      </header>

      <div className={styles.addressSection}>
        <div className={styles.addressRow}>
          <div>
            <div className={styles.subtext}>
              {isConnected ? "Connected address" : "No wallet connected"}
            </div>
            <div className={styles.addressValue}>
              {isConnected ? address : "—"}
            </div>
          </div>
          <div className={styles.sandboxLabel}>
            <i className="fa-solid fa-helmet-safety" aria-hidden="true" />
            Sandbox: no real txs
          </div>
        </div>
        <div className={styles.actions}>
          {isConnected ? (
            <>
              <button
                className={styles.buttonPrimary}
                onClick={() => setTipModalOpen(true)}
                type="button"
              >
                <i className="fa-solid fa-gift" aria-hidden="true" />
                Send demo tip
              </button>
              <button
                className={styles.buttonSecondary}
                onClick={handleDisconnect}
                type="button"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
                Reset session
              </button>
            </>
          ) : (
            <button
              className={styles.buttonPrimary}
              disabled={connecting}
              onClick={handleConnect}
              type="button"
            >
              <i className="fa-solid fa-plug" aria-hidden="true" />
              {connecting ? "Connecting…" : "Connect sandbox wallet"}
            </button>
          )}
        </div>
        {connectError ? (
          <div className={styles.error} role="alert">
            {connectError}
          </div>
        ) : null}
      </div>

      <div className={styles.modules}>
        <IntegrityBadge isDemoMode={isDemoMode} postId="wallet-demo" />
        <HumanityPanel address={address} isDemoMode={isDemoMode} />
      </div>

      <section aria-live="polite">
        <div className={styles.recentTipsHeader}>
          <h3 className={styles.recentTipsTitle}>Recent sandbox tips</h3>
          <span className={styles.recentTipsBadge}>
            {recentTips.length} recorded
          </span>
        </div>
        {recentTips.length > 0 ? (
          <ul className={styles.tipsList}>
            {recentTips.map((tip) => {
              const timestamp = new Date(tip.ts);
              const formatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(timestamp);
              return (
                <li key={tip.txHash} className={styles.tipItem}>
                  <div>
                    <strong>
                      {tip.amount} {tip.token}
                    </strong>{" "}
                    on {tip.chain}
                  </div>
                  <div className={styles.tipMeta}>
                    {tip.demo ? (
                      <span className={styles.moduleBadge}>Sandbox</span>
                    ) : null}
                    <span>{formatted}</span>
                    <span>Post: {tip.postId}</span>
                    <span>Hash: {tip.txHash}</span>
                  </div>
                  {tip.note ? (
                    <p className={styles.subtext}>{tip.note}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptyState}>
            No sandbox tips recorded yet. Connect and send one to populate the
            feed.
          </p>
        )}
      </section>

      <TipModal
        address={address}
        error={tipError}
        isOpen={tipModalOpen}
        isSubmitting={isSubmittingTip}
        onClose={() => {
          setTipModalOpen(false);
          setTipError(null);
        }}
        onSubmit={handleSubmitTip}
      />
    </section>
  );
}
