"use client";

import { useState } from "react";

import styles from "./media-kit.module.scss";

type Asset = {
  path: string;
  label: string;
  bytes: string;
  type: string;
};

type Bios = {
  oneLiner: string;
  short: string;
  long: string;
};

type MediaClientPageProps = {
  bios: Bios;
  headshots: Asset[];
  logos: Asset[];
  bioAssets: Asset[];
};

export default function MediaClientPage({ bios, headshots, logos, bioAssets }: MediaClientPageProps) {
  const [copiedBio, setCopiedBio] = useState<string | null>(null);

  const handleCopyBio = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBio(label);
      setTimeout(() => setCopiedBio(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>Press resources</p>
          <h1 className={`u-heading-xl ${styles.heroTitle}`}>Media Kit</h1>
          <p className={styles.heroSummary}>
            Biography variants, headshots, and logos for editorial use. All materials are cleared for publication with attribution.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Biography</h2>
          <p className={styles.sectionSummary}>Click any text to copy to clipboard</p>
        </header>

        <div className={styles.bioList}>
          <article className={styles.bioItem}>
            <button
              type="button"
              className={styles.bioButton}
              onClick={() => handleCopyBio(bios.oneLiner, "one-liner")}
            >
              <div className={styles.bioCard}>
                <div className={styles.bioHeader}>
                  <span className={styles.bioLabel}>One-liner</span>
                  <span className={styles.bioCopyHint}>
                    {copiedBio === "one-liner" ? "✓ Copied" : "Copy"}
                  </span>
                </div>
                <p className={styles.bioText}>{bios.oneLiner}</p>
              </div>
            </button>
          </article>

          <article className={styles.bioItem}>
            <button
              type="button"
              className={styles.bioButton}
              onClick={() => handleCopyBio(bios.short, "short")}
            >
              <div className={styles.bioCard}>
                <div className={styles.bioHeader}>
                  <span className={styles.bioLabel}>Short</span>
                  <span className={styles.bioCopyHint}>
                    {copiedBio === "short" ? "✓ Copied" : "Copy"}
                  </span>
                </div>
                <p className={styles.bioText}>{bios.short}</p>
              </div>
            </button>
          </article>

          <article className={styles.bioItem}>
            <button
              type="button"
              className={styles.bioButton}
              onClick={() => handleCopyBio(bios.long, "long")}
            >
              <div className={styles.bioCard}>
                <div className={styles.bioHeader}>
                  <span className={styles.bioLabel}>Long</span>
                  <span className={styles.bioCopyHint}>
                    {copiedBio === "long" ? "✓ Copied" : "Copy"}
                  </span>
                </div>
                <p className={styles.bioText}>{bios.long}</p>
              </div>
            </button>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Downloads</h2>
          <p className={styles.sectionSummary}>High-resolution assets for press and media use</p>
        </header>

        {headshots.length > 0 && (
          <div className={styles.assetGroup}>
            <h3 className={styles.assetGroupTitle}>Headshots</h3>
            <div className={styles.assetList}>
              {headshots.map((asset) => (
                <a
                  key={asset.path}
                  href={asset.path}
                  download
                  className={styles.assetItem}
                >
                  <span className={styles.assetLabel}>{asset.label}</span>
                  <span className={styles.assetMeta}>{asset.bytes}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {logos.length > 0 && (
          <div className={styles.assetGroup}>
            <h3 className={styles.assetGroupTitle}>Logos</h3>
            <div className={styles.assetList}>
              {logos.map((asset) => (
                <a
                  key={asset.path}
                  href={asset.path}
                  download
                  className={styles.assetItem}
                >
                  <span className={styles.assetLabel}>{asset.label}</span>
                  <span className={styles.assetMeta}>{asset.bytes}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {bioAssets.length > 0 && (
          <div className={styles.assetGroup}>
            <h3 className={styles.assetGroupTitle}>Documents</h3>
            <div className={styles.assetList}>
              {bioAssets.map((asset) => (
                <a
                  key={asset.path}
                  href={asset.path}
                  download
                  className={styles.assetItem}
                >
                  <span className={styles.assetLabel}>{asset.label}</span>
                  <span className={styles.assetMeta}>{asset.bytes}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
