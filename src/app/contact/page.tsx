// src/app/contact/page.tsx
import clsx from "clsx";
import type { Metadata } from "next";

import ContactForm from "./ContactForm";
import styles from "./contact.module.scss";

export const metadata: Metadata = {
  title: "Contact | Paula Livingstone",
  description: "Reach Paula directly — messages here come straight to her.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Paula Livingstone",
    description: "Reach Paula directly — messages here come straight to her.",
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
    title: "Contact | Paula Livingstone",
    description: "Reach Paula directly — messages here come straight to her.",
    images: ["/window.svg"],
  },
};

export default function ContactPage() {
  return (
    <section className={styles.contactRoot}>
      <div className={styles.stage}>
        <div className={styles.card}>
          <header className={styles.header}>
            <h1 className={clsx("heading-section", styles.hTitle)}>
              <span aria-hidden className={styles.hDot} />
              Contact
            </h1>
            <p className={styles.preface}>
              If you want to talk, this form comes straight to me.
            </p>
          </header>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
