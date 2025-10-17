import type { ReactNode } from "react";

import { Tabs } from "./tabs";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Tabs />
      <div className="mt-4">{children}</div>
    </div>
  );
}
