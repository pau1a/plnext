import clsx from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import styles from "./PageShell.module.scss";

type PageShellProps = ComponentPropsWithoutRef<"div"> & {
  /** Render the outer element as main/section/div (default div). */
  as?: "main" | "section" | "div";
  /** Optional classes applied to the outer shell wrapper. */
  outerClassName?: string;
  /** Render the shell at full width without the constrained container. */
  fullWidth?: boolean;
};

const PageShell = forwardRef<HTMLElement, PageShellProps>(function PageShell(
  { as = "div", children, className, outerClassName, fullWidth = false, ...rest },
  ref,
) {
  const OuterTag = as;

  if (fullWidth) {
    return (
      <OuterTag
        ref={ref}
        className={clsx(styles.shell, outerClassName, className)}
        {...rest}
      >
        {children}
      </OuterTag>
    );
  }

  return (
    <OuterTag ref={ref} className={clsx(styles.shell, outerClassName)}>
      <div className={clsx("l-container", className)} {...rest}>
        {children}
      </div>
    </OuterTag>
  );
});

export default PageShell;
