import React from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./about-badges.module.scss";

type AboutBadgesProps = {
  labels: readonly string[];
} & HTMLAttributes<HTMLUListElement>;

export function AboutBadges({ labels, className, ...props }: AboutBadgesProps) {
  return (
    <ul className={clsx(styles.badgeList, className)} role="list" {...props}>
      {labels.map((label) => (
        <li key={label} className={styles.badgeItem} role="listitem">
          <span className={styles.badge}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export default AboutBadges;
