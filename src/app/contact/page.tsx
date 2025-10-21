// src/app/contact/page.tsx
import clsx from "clsx";
import type { Metadata } from "next";

import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";

import ContactColorCalibrator from "./ContactColorCalibrator";
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
    <PageShell as="main" fullWidth>
      <section className={styles.contactRoot}>
        <ContactColorCalibrator
          imgSrc="https://cdn.networklayer.co.uk/paulalivingstone/images/mooreaglesham.png"
          targetSelector={`.${styles.contactRoot}`}
          sampleHeightPct={12}
        />
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.heroEyebrow}>Direct channel</p>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleWord}>Contact</span>
              <span className={styles.heroTitleWord}>Paula</span>
            </h1>
            <span aria-hidden="true" className={styles.heroDivider} />
            <p className={styles.heroLead}>
              Reach Paula directly — messages here come straight to her.
            </p>
          </div>
        </div>
        <div className={styles.stage}>
          <MotionFade delay={0.05}>
            <div className={clsx(elevatedSurfaceStyles.elevatedSurface, styles.card)}>
              <MotionFade delay={0.15}>
                <div>
                  <header className={styles.header}>
                    <h2 className={clsx("heading-section", styles.formTitle)}>
                      Send a direct request
                    </h2>
                    <p className={styles.preface}>
                      Share context, timeframes, and stakes. The more signal
                      you provide, the faster the reply.
                    </p>
                  </header>
                  <ContactForm />
                </div>
              </MotionFade>
            </div>
          </MotionFade>
        </div>
        <div aria-hidden="true" className={styles.belowBlend} />
      </section>
    </PageShell>
  );
}
