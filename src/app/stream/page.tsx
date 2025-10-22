import Link from "next/link";
import type { Metadata } from "next";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { StreamItem } from "@/components/stream/StreamItem";
import { loadStream } from "@/lib/stream";

import styles from "./page.module.scss";

const BASE_PATH = "/stream";

export const metadata: Metadata = {
  title: "Stream | Paula Livingstone",
  description: "Short, timestamped notes. Public subset.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Stream",
    description: "Short, timestamped notes. Public subset.",
    url: BASE_PATH,
  },
  twitter: {
    title: "Stream",
    description: "Short, timestamped notes. Public subset.",
  },
};

export default async function StreamPage() {
  const entries = await loadStream();

  return (
    <PageShell as="main" className="u-pad-block-3xl" outerClassName={styles.main}>
      <div className={styles.inner}>
        <MotionFade>
          <div className={styles.header}>
            <Link href="/about" className={styles.backLink}>
              <i aria-hidden className="fa-solid fa-arrow-left" />
              <span>Back to About</span>
            </Link>
            <h1 className={styles.title}>Stream</h1>
            <p className={styles.description}>
              Short, timestamped notes. Public subset. The rest stay private.
            </p>
          </div>
        </MotionFade>

        <MotionFade delay={0.05}>
          {entries.length > 0 ? (
            <section className={styles.list} aria-label="Stream entries">
              {entries.map((entry) => (
                <StreamItem key={entry.id} entry={entry} />
              ))}
            </section>
          ) : (
            <p className="u-text-muted">No public entries yet.</p>
          )}
        </MotionFade>
      </div>
    </PageShell>
  );
}
