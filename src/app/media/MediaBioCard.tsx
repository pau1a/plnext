"use client";

import { useState } from "react";

interface MediaBioCardProps {
  title: string;
  content: string;
  icon: string;
}

export default function MediaBioCard({ title, content, icon }: MediaBioCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      className="media-bio-card"
      onClick={handleCopy}
      aria-label={`Copy ${title} bio to clipboard`}
    >
      <div className="media-bio-card__header">
        <div className="media-bio-card__icon-wrapper">
          <i className={`fa-solid ${icon} media-bio-card__icon`} aria-hidden="true"></i>
        </div>
        <h3 className="media-bio-card__title">{title}</h3>
        <div className="media-bio-card__copy-indicator">
          {copied ? (
            <>
              <i className="fa-solid fa-check" aria-hidden="true"></i>
              <span className="media-bio-card__copy-text">Copied!</span>
            </>
          ) : (
            <>
              <i className="fa-regular fa-copy" aria-hidden="true"></i>
              <span className="media-bio-card__copy-text">Copy</span>
            </>
          )}
        </div>
      </div>
      <p className="media-bio-card__content">{content}</p>
    </button>
  );
}
