"use client";

import { DefaultSeo } from "next-seo";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

// Wraps the application with next-themes and next-seo so the showcase demo can
// toggle themes and customise default metadata without affecting other routes.
export default function ShowcaseAppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <DefaultSeo
        titleTemplate="%s | Paula Livingstone"
        defaultTitle="Paula Livingstone — Portfolio"
        description="Exploring Paula Livingstone's cybersecurity and engineering work."
        openGraph={{
          title: "Paula Livingstone — Portfolio",
          description: "Exploring Paula Livingstone's cybersecurity and engineering work.",
          url: "https://example.com",
          type: "website",
          images: [
            {
              url: "https://example.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: "Abstract cyber grid illustrating innovation",
            },
          ],
        }}
        twitter={{
          handle: "@paulalivingstone",
          site: "@paulalivingstone",
          cardType: "summary_large_image",
        }}
      />
      {children}
    </ThemeProvider>
  );
}
