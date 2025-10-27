"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TABS = [
  { key: "optimist", label: "Optimist", accent: "bg-[hsl(var(--teal-500))]" },
  { key: "engineer", label: "Engineer", accent: "bg-[hsl(var(--crimson-500))]" },
  { key: "adventurer", label: "Adventurer", accent: "bg-foreground" },
] as const;

export default function Page() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("optimist");
  const shouldReduceMotion = useReducedMotion();

  const panelMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25 },
      };

  return (
    <main className="pb-16 md:pb-24">
      <section className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">Building calm in complex systems</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-prose">
          Three lenses — <strong>Optimist</strong>, <strong>Engineer</strong>, <strong>Adventurer</strong> — inform how I design
          secure automation.
        </p>

        <div className="mt-6">
          <div className="flex gap-2">
            {TABS.map((tab) => {
              const isActive = tab.key === active;
              const underlineTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" };

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={[
                    "relative rounded-xl px-4 py-2 text-sm md:text-[15px] transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--crimson-500))]",
                    isActive
                      ? "bg-white/90 dark:bg-neutral-900/60 ring-1 ring-black/5 dark:ring-white/10 shadow"
                      : "hover:bg-white/70 dark:hover:bg-neutral-900/40",
                  ].join(" ")}
                >
                  <span className={isActive ? "font-semibold" : ""}>{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="triad-underline"
                      className={`absolute -bottom-1 left-3 right-3 h-1 rounded-full ${tab.accent}`}
                      transition={underlineTransition}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 md:p-7 bg-white/80 dark:bg-neutral-900/60 backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div key={active} {...panelMotion}>
                {active === "optimist" && (
                  <p className="text-[15px] leading-relaxed">
                    Optimism means plotting toward better states: safer change windows, quieter on-call, smaller incidents.
                  </p>
                )}
                {active === "engineer" && (
                  <p className="text-[15px] leading-relaxed">
                    Engineering is measurement-led design: layered defences, IEC 62443 alignment, controls and infrastructure as
                    code.
                  </p>
                )}
                {active === "adventurer" && (
                  <p className="text-[15px] leading-relaxed">
                    Adventure is curiosity under constraints: Python-first ML, secure MLOps, lineage, drift, adversarial
                    robustness.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}
