"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/about/about1", label: "About 1" },
  { href: "/about/about2", label: "About 2" },
  { href: "/about/about3", label: "About 3" },
  { href: "/about/about4", label: "About 4" },
  { href: "/about/about5", label: "About 5" },
];

export function Tabs() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl p-2 bg-[hsl(var(--teal-50))] dark:bg-[hsl(var(--teal-900)/0.3)] ring-1 ring-black/5 dark:ring-white/10">
      <ul className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm md:text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--crimson-500))] transition",
                  active
                    ? "bg-[hsl(var(--teal-200))] text-[hsl(var(--teal-900))] dark:bg-[hsl(var(--teal-800))] dark:text-[hsl(var(--teal-100))] shadow"
                    : "bg-white/70 dark:bg-neutral-900/40 hover:bg-white/90 dark:hover:bg-neutral-900/60",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
