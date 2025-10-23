import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function StreamPreview({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-streampreview"
      className={clsx(styles.section, styles.sectionDark, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>Stream preview placeholder.</h2>
        <p className={styles.sectionDescription}>
          Upcoming realtime stream entries and changelog snippets will surface
          here to highlight ongoing work and experimentation.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /stream</p>
      </div>
    </section>
  );
}
