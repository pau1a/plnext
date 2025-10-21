import clsx from "clsx";
import type { PropsWithChildren } from "react";

import styles from "./page-shell.module.scss";

type PageShellProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
}>;

export default function PageShell({
  children,
  className,
  contentClassName,
}: PageShellProps) {
  return (
    <div className={clsx(styles.shell, className)}>
      <div className={clsx("l-container", contentClassName)}>{children}</div>
    </div>
  );
}
