import React from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

import styles from "./principle-card.module.scss";

type PrincipleCardProps = {
  title: string;
  body: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function PrincipleCard({ title, body, className, ...props }: PrincipleCardProps) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </div>
  );
}

export default PrincipleCard;
