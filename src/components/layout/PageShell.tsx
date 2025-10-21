import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import styles from "./PageShell.module.scss";

type PageShellProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * Optional classes applied to the outer shell wrapper.
   */
  outerClassName?: string;
  /**
   * Render the shell at full width without the constrained container.
   */
  fullWidth?: boolean;
};

export default function PageShell({
  children,
  className,
  outerClassName,
  fullWidth = false,
  ...rest
}: PageShellProps) {
  if (fullWidth) {
    return (
      <div className={clsx(styles.shell, outerClassName, className)} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <div className={clsx(styles.shell, outerClassName)}>
      <div className={clsx("l-container", className)} {...rest}>
        {children}
      </div>
    </div>
  );
}
