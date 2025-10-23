import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function AboutCapsule({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-aboutcapsule"
      className={clsx(styles.section, styles.sectionLight, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>About placeholder section.</h2>
        <p className={styles.sectionDescription}>
          A concise summary about Paula will appear here, potentially paired
          with an optional portrait or supporting image once the content is
          ready.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /about</p>
      </div>
    </section>
  );
}
