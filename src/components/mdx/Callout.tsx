import type { PropsWithChildren, ReactNode } from "react";

import styles from "./callout.module.scss";

interface CalloutProps {
  title?: ReactNode;
}

export default function Callout({ title, children }: PropsWithChildren<CalloutProps>) {
  return (
    <div className={styles.callout}>
      {title ? <p className={styles.title}>{title}</p> : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
