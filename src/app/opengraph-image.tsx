import type { CSSProperties } from "react";
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const runtime = "edge";

const backgroundGradient =
  "linear-gradient(180deg, #0f172a 0%, #1e293b 45%, #f8fafc 100%)";

const cardStyles: CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "72px",
  backgroundImage: backgroundGradient,
  color: "#f8fafc",
};

const headingStyles: CSSProperties = {
  fontSize: 88,
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: -1.5,
};

const subheadingStyles: CSSProperties = {
  fontSize: 40,
  lineHeight: 1.35,
  maxWidth: 720,
  color: "rgba(248, 250, 252, 0.82)",
};

const footerStyles: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 28,
  color: "rgba(148, 163, 184, 0.9)",
};

const accentBarStyles: CSSProperties = {
  width: "100%",
  height: 6,
  borderRadius: 999,
  background: "linear-gradient(90deg, #e23b6b 0%, #14b8a6 100%)",
  marginBottom: 40,
};

export function createSocialImage() {
  return (
    <div style={cardStyles}>
      <div style={accentBarStyles} />
      <div>
        <h1 style={headingStyles}>Paula Livingstone</h1>
        <p style={subheadingStyles}>
          Cybersecurity leader building resilient platforms that balance risk,
          speed, and clarity.
        </p>
      </div>
      <div style={footerStyles}>
        <span>paulalivingstone.com</span>
        <span>Security · Strategy · Clarity</span>
      </div>
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(createSocialImage(), {
    ...size,
  });
}
