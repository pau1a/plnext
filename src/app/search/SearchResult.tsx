"use client";

import Link from "next/link";
import { useState } from "react";
import type { SearchResult } from "@/lib/search";
import { formatDate } from "@/lib/date";
import { usePrefersReducedMotion } from "@/lib/motion";

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
  const colorByType: Record<SearchResult["type"], string> = {
    essay: "var(--color-purple-600)",
    blog: "var(--color-blue-600)",
    project: "var(--color-green-600)",
    note: "var(--color-teal-600)",
    stream: "var(--color-crimson-600)",
  };

  return colorByType[type] ?? "var(--text-muted)";
}

export default function SearchResultItem({ result }: SearchResultProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);

  const isInteracting = isHovered || isPressed;

  return (
    <article
      style={{
        background: "color-mix(in srgb, var(--surface-base) 85%, white 15%)",
        border: isInteracting
          ? "1px solid color-mix(in srgb, var(--surface-border) 100%, transparent)"
          : "1px solid color-mix(in srgb, var(--surface-border) 75%, transparent)",
        borderRadius: "var(--radius-md)",
        padding: "clamp(1.25rem, 2.5vw, 1.75rem)",
        transition: prefersReducedMotion
          ? "border-color 160ms ease, box-shadow 160ms ease"
          : "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        transform: prefersReducedMotion
          ? undefined
          : isInteracting
            ? "translateY(-2px)"
            : "translateY(0)",
        boxShadow: isInteracting ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={(event) => {
        setIsPressed(false);

        if (event.pointerType !== "mouse") {
          setIsHovered(false);
        }
      }}
      onPointerCancel={() => {
        setIsPressed(false);
        setIsHovered(false);
      }}
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
          onPointerEnter={() => setIsTitleHovered(true)}
          onPointerLeave={() => setIsTitleHovered(false)}
          onPointerCancel={() => setIsTitleHovered(false)}
          onFocus={() => setIsTitleHovered(true)}
          onBlur={() => setIsTitleHovered(false)}
        >
          {result.title}
        </Link>
      </h2>

      <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "var(--space-sm)" }}>
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
