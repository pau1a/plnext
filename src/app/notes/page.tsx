import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { NoteList } from "@/components/notes/NoteList";
import { getNotes } from "@/lib/notes";
import type { Metadata } from "next";

import styles from "./notes.module.scss";

const BASE_PATH = "/notes";

export const metadata: Metadata = {
  title: "Notes | Paula Livingstone",
  description: "Short observations and technical reflections.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Notes",
    description: "Short observations and technical reflections.",
    url: BASE_PATH,
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
    title: "Notes",
    description: "Short observations and technical reflections.",
    images: ["/window.svg"],
  },
};

export default async function NotesIndexPage() {
  const notes = await getNotes({ includeDrafts: false });

  return (
    <PageShell as="main" outerClassName={styles.page} fullWidth>
      <div className={styles.hero} aria-hidden="true">
        <div className={styles.heroVeil} />
        <div className={`${styles.heroOrb} ${styles.heroOrbNorth}`} />
        <div className={`${styles.heroOrb} ${styles.heroOrbSouth}`} />
      </div>

      <div className={styles.inner}>
        <section className={styles.section}>
          <MotionFade>
            <header className={styles.header}>
              <span className={styles.headerEyebrow}>Signal snippets</span>
              <h1 className={styles.headerTitle}>Notes</h1>
              <p className={styles.headerSummary}>
                Short, self-contained updates from the workbench&mdash;less formal than essays, still public by default.
              </p>
              <div className={styles.headerDivider} aria-hidden="true" />
            </header>
          </MotionFade>

          <MotionFade delay={0.05}>
            <NoteList notes={notes} className={styles.list} />
          </MotionFade>
        </section>
      </div>
    </PageShell>
  );
}
