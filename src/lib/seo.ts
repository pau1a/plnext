import type { DefaultSeoProps } from "next-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

export const defaultSeoConfig: DefaultSeoProps = {
  defaultTitle: "Paula Livingstone",
  titleTemplate: "%s | Paula Livingstone",
  description: "Cybersecurity leader building resilient platforms that balance risk, speed, and clarity.",
  canonical: siteUrl,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Paula Livingstone",
    images: [
      {
        url: `${siteUrl}/window.svg`,
        width: 1200,
        height: 630,
        alt: "Paula Livingstone",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
  additionalLinkTags: [
    {
      rel: "alternate",
      type: "application/rss+xml",
      href: `${siteUrl}/rss.xml`,
    },
  ],
};
