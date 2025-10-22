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
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone brand card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paula Livingstone",
    description: "Cybersecurity leader building resilient platforms that balance risk, speed, and clarity.",
    images: ["/twitter-image"],
  },
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

