import "@/styles/globals.scss";
import AppShell from "@/components/app-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

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
  },
  twitter: {
    card: "summary_large_image",
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
      <AppShell>{children}</AppShell>
    </html>
  );
}

