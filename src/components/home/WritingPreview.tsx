import clsx from "clsx";

import styles from "@/styles/home.module.scss";

import type { HomeSectionProps } from "./types";

export default function WritingPreview({
  className,
  style,
}: HomeSectionProps) {
  return (
    <section
      id="section-home-writingpreview"
      className={clsx(styles.section, styles.sectionDark, className)}
      data-home-section
      style={style}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>Writing preview placeholder.</h2>
        <p className={styles.sectionDescription}>
          Future published essays from the writing archive will be featured in
          this space once the storytelling layer is connected.
        </p>
        <p className={styles.sectionMeta}>Intended final link: /writing</p>
      </div>
    </section>
  );
}
