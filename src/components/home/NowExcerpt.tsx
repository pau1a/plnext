import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function NowExcerpt({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-nowexcerpt"
      className={clsx(styles.section, styles.sectionDark, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>Now excerpt placeholder.</h2>
        <p className={styles.sectionDescription}>
          A snapshot of Paula’s current professional focus and priorities will
          land here, distilled from the evolving /now page content.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /now</p>
      </div>
    </section>
  );
}
