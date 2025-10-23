import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function ProjectPreview({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-projectpreview"
      className={clsx(styles.section, styles.sectionLight, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>Project preview placeholder.</h2>
        <p className={styles.sectionDescription}>
          Representative project highlights and engineering retrospectives will
          eventually be curated in this dedicated preview list.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /projects</p>
      </div>
    </section>
  );
}
