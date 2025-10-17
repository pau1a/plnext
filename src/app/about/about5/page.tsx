"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHOTO = "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";
const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const PRINCIPLES = [
  "Narrow the blast radius",
  "Increase visibility",
  "Shorten recovery",
  "Keep people out of headlines",
] as const;

export default function Page() {
  const shouldReduceMotion = useReducedMotion();
  const heroMotion = useMemo(
    () => ({
      variants: fade,
      initial: shouldReduceMotion ? undefined : "hidden",
      animate: shouldReduceMotion ? undefined : "show",
    }),
    [shouldReduceMotion],
  );

  return (
    <main className="pb-16 md:pb-24">
      <section className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14 relative">
        <motion.h1 {...heroMotion} className="text-4xl md:text-6xl font-semibold leading-tight max-w-3xl">
          Building calm in complex systems
        </motion.h1>
        <motion.div
          {...heroMotion}
          className="absolute right-4 top-4"
          aria-label="Optimist | Engineer | Adventurer"
        >
          <div className="rounded-full bg-[hsl(var(--graphite-900)/0.45)] text-white backdrop-blur px-4 py-1.5 text-xs tracking-widest uppercase">
            Optimist | Engineer | Adventurer
          </div>
        </motion.div>
        <motion.p {...heroMotion} className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
          I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My focus
          is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast radius.
        </motion.p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <motion.div
            {...heroMotion}
            className="md:col-span-1 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Paula Livingstone" className="w-full aspect-[4/5] object-cover" loading="lazy" />
          </motion.div>

          <motion.article
            {...heroMotion}
            className="md:col-span-2 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur ring-1 ring-black/5 dark:ring-white/10 p-6"
          >
            <h3 className="text-lg font-semibold">From RF to AI-secured automation</h3>
            <p className="text-muted-foreground mt-2">
              My career began in military radio and satellite systems and matured through large-scale IP networking. Today I focus on
              AI-enabled operations for industrial environments. I design layered defences, instrument estates so risk is measured not guessed,
              and remove toil with code so teams can focus on the hard problems.
            </p>
          </motion.article>

          <motion.article
            {...heroMotion}
            className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10"
          >
            <h3 className="text-lg font-semibold">Security by design</h3>
            <p className="text-muted-foreground mt-2">
              I shape security by design for OT and automation programmes and align controls to recognised standards such as IEC 62443.
              I am the person teams tap to untangle cross-discipline problems when they cut across layers and refuse to fit into one box.
            </p>
          </motion.article>

          <motion.article
            {...heroMotion}
            className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10"
          >
            <h3 className="text-lg font-semibold">Python-first ML &amp; MLOps</h3>
            <p className="text-muted-foreground mt-2">
              I build guardrails that let models survive contact with production, including secure MLOps, model and data lineage, drift
              detection, and adversarial robustness.
            </p>
          </motion.article>

          <motion.article
            {...heroMotion}
            className="rounded-2xl p-6 bg-white/70 dark:bg-neutral-900/60 backdrop-blur ring-1 ring-black/5 dark:ring-white/10"
          >
            <h3 className="text-lg font-semibold">Constants</h3>
            <ul className="mt-2 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
              {PRINCIPLES.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              If the future is AI and automation, it needs engineers who can secure it end to end. That is my lane.
            </p>
          </motion.article>
        </div>
      </section>
    </main>
  );
}
