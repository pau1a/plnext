import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function NotesPreview({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-notespreview"
      className={clsx(styles.section, styles.sectionLight, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>Notes preview placeholder.</h2>
        <p className={styles.sectionDescription}>
          The newest working notes and field observations will eventually
          populate this stream-friendly summary block for quick scanning.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /notes</p>
      </div>
    </section>
  );
}
