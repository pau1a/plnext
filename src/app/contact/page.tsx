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
    <PageShell as="main" fullWidth outerClassName={styles.pageShellOverride}>
      <section className={styles.contactRoot}>
        <ContactColorCalibrator
          imgSrc="https://cdn.networklayer.co.uk/paulalivingstone/images/mooreaglesham.png"
          targetSelector={`.${styles.contactRoot}`}
          sampleHeightPct={12}
        />
        <div className={styles.stage}>
          <MotionFade delay={0.05}>
            <div className={clsx(elevatedSurfaceStyles.elevatedSurface, styles.card)}>
              <MotionFade delay={0.15}>
                <div>
                  <header className={styles.header}>
                    <h1 className={clsx("u-heading-display", styles.hTitle)}>
                      Contact
                    </h1>
                    <p className={styles.preface}>
                      If you’ve got something real to say, this lands straight
                      in my inbox.
                    </p>
                  </header>
                  <ContactForm />
                </div>
              </MotionFade>
            </div>
          </MotionFade>
        </div>
      </section>
    </PageShell>
  );
}
