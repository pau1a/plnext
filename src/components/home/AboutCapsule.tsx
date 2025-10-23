import clsx from "clsx";
import Link from "next/link";

import styles from "./AboutCapsule.module.scss";

import type { HomeSectionProps } from "./types";

export default function AboutCapsule({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-aboutcapsule"
      className={clsx(styles.aboutSection, className)}
      data-home-section
      style={style}
    >
      <div className={styles.inner}>
        <div className={styles.seamRule} aria-hidden="true" />

        <div className={styles.content}>
          <h2 className={styles.heading}>About</h2>
          <div className={styles.copy}>
            <p>There’s a moment when turbulence has to turn into control.</p>
            <p>That’s where I work.</p>
            <p>
              I build systems that stay steady when things get unpredictable —
              the kind that keep automation, energy, and industry safe to rely
              on. Decades of engineering have taught me that reliability isn’t a
              by-product of technology; it’s the outcome of clarity, rehearsal,
              and restraint.
            </p>
            <p>
              My work is about keeping that clarity as automation grows more
              intelligent and the stakes rise. Making complexity calm. Turning
              risk into rhythm. Keeping everything that matters flying straight.
              {" "}
              <Link href="/about" className={styles.link}>
                More →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
