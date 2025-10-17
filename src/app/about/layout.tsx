"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { href: "/about/about1", label: "About 1" },
  { href: "/about/about2", label: "About 2" },
  { href: "/about/about3", label: "About 3" },
  { href: "/about/about4", label: "About 4" },
  { href: "/about/about5", label: "About 5" },
] as const;

export default function AboutLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <nav className="rounded-2xl p-2 bg-[hsl(var(--teal-50))] dark:bg-[hsl(var(--teal-900)/0.25)] ring-1 ring-black/5 dark:ring-white/10">
        <ul className="grid grid-cols-5 gap-2">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={[
                    "block rounded-xl px-3 py-2 text-sm md:text-[15px] transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--crimson-500))]",
                    active
                      ? "bg-[hsl(var(--teal-200))] text-[hsl(var(--teal-900))] dark:bg-[hsl(var(--teal-800))] dark:text-[hsl(var(--teal-100))] shadow"
                      : "bg-white/80 dark:bg-neutral-900/40 hover:bg-white/95 dark:hover:bg-neutral-900/60",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
