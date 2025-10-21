// src/app/contact/page.tsx
import type { Metadata } from "next";

import PageShell from "@/components/layout/PageShell";

import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Paula Livingstone",
  description: "Start a conversation about security, reliability, or AI delivery support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Paula Livingstone",
    description: "Start a conversation about security, reliability, or AI delivery support.",
    url: "/contact",
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    title: "Contact Paula Livingstone",
    description: "Start a conversation about security, reliability, or AI delivery support.",
    images: ["/window.svg"],
  },
};

export default function Contact() {
  return (
    <PageShell contentClassName="motion-fade-in u-pad-block-3xl">
      <ContactForm />
    </PageShell>
  );
}
