"use client";

import Link from "next/link";
import { useState } from "react";
import type { SearchResult } from "@/lib/search";
import { formatDate } from "@/lib/date";

interface SearchResultProps {
  result: SearchResult;
}

function getResultTypeLabel(type: SearchResult["type"]): string {
  switch (type) {
    case "essay":
      return "Essay";
    case "blog":
      return "Blog Post";
    case "project":
      return "Project";
    case "note":
      return "Note";
    case "stream":
      return "Stream";
    default:
      return "Content";
  }
}

function getResultTypeColor(type: SearchResult["type"]): string {
  switch (type) {
    case "essay":
      return "var(--color-purple-600)";
    case "blog":
      return "var(--color-blue-600)";
    case "project":
      return "var(--color-green-600)";
    case "note":
      return "var(--color-teal-600)";
    case "stream":
      return "var(--color-crimson-600)";
    default:
      return "var(--text-muted)";
  }
}

export default function SearchResultItem({ result }: SearchResultProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);

  return (
    <article
      style={{
        background: "color-mix(in srgb, var(--surface-base) 85%, white 15%)",
        border: isHovered
          ? "1px solid color-mix(in srgb, var(--surface-border) 100%, transparent)"
          : "1px solid color-mix(in srgb, var(--surface-border) 75%, transparent)",
        borderRadius: "var(--radius-md)",
        padding: "clamp(1.25rem, 2.5vw, 1.75rem)",
        transition: "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered ? "0 8px 24px color-mix(in srgb, var(--shadow-color) 12%, transparent)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center", marginBottom: "var(--space-sm)" }}>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: getResultTypeColor(result.type),
          }}
        >
          {getResultTypeLabel(result.type)}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {formatDate(result.date)}
        </span>
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "var(--space-sm)" }}>
        <Link
          href={result.href}
          style={{
            textDecoration: "none",
            color: isTitleHovered ? "var(--link-hover)" : "inherit",
            transition: "color 160ms ease",
          }}
          onMouseEnter={() => setIsTitleHovered(true)}
          onMouseLeave={() => setIsTitleHovered(false)}
        >
          {result.title}
        </Link>
      </h2>

      <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--space-sm)" }}>
        {result.excerpt}
      </p>

      {result.tags && result.tags.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {result.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
                background: "color-mix(in srgb, var(--surface-border) 30%, transparent)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
