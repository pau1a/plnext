import type { ComponentPropsWithoutRef } from "react";

export type HomeSectionProps = Pick<
  ComponentPropsWithoutRef<"section">,
  "className" | "style"
>;
