import "@/styles/globals.scss";
import AppShell from "@/components/app-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Paula Livingstone",
  url: siteUrl,
  description: "Cybersecurity leader building resilient platforms that balance risk, speed, and clarity.",
  publisher: {
    "@type": "Person",
    name: "Paula Livingstone",
  },
  inLanguage: "en-GB",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Paula Livingstone",
    template: "%s | Paula Livingstone",
  },
  description: "Cybersecurity leader building resilient platforms that balance risk, speed, and clarity.",
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "en_GB",
    siteName: "Paula Livingstone",
    images: [
      {
        url: `${siteUrl}/window.svg`,
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paula Livingstone",
    description: "Cybersecurity leader building resilient platforms that balance risk, speed, and clarity.",
    images: [`${siteUrl}/window.svg`],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <AppShell>{children}</AppShell>
    </html>
  );
}
