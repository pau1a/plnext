"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    year: "RF / Satcom",
    text: "Military radio and satellite systems. Bias for reliable comms and isolation.",
  },
  {
    year: "Large-scale IP",
    text: "Scaled networks. Discipline in observability and failure domains.",
  },
  {
    year: "OT & Automation",
    text: "Security by design for industrial systems (IEC 62443 alignment).",
  },
  {
    year: "AI Ops",
    text: "Python-first ML, secure MLOps, lineage, drift, adversarial robustness.",
  },
] as const;

const PRINCIPLES = [
  "Narrow the blast radius",
  "Increase visibility",
  "Shorten recovery",
  "Keep people out of headlines",
] as const;

export default function Page() {
  const shouldReduceMotion = useReducedMotion();
  const timelineMotion = useMemo(
    () =>
      shouldReduceMotion
        ? { initial: false, whileInView: undefined }
        : {
            initial: "hidden" as const,
            whileInView: "show" as const,
            viewport: { once: true, amount: 0.3 },
            variants: {
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            } as const,
          },
    [shouldReduceMotion],
  );

  return (
    <main className="pb-16 md:pb-24">
      <section className="container mx-auto max-w-4xl px-4 pt-10 md:pt-14">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">Building calm in complex systems</h1>
        <p className="mt-2 text-xs md:text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Optimist | Engineer | Adventurer
        </p>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My focus
          is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast radius.
        </p>

        <div className="mt-8 relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-[hsl(var(--teal-300))]" aria-hidden />
          <ul className="space-y-8">
            {STEPS.map((step) => (
              <motion.li key={step.year} {...timelineMotion}>
                <div className="relative md:w-1/2 md:ml-auto md:pl-10">
                  <span className="absolute -left-[10px] md:-left-[12px] top-1 h-3 w-3 rounded-full bg-[hsl(var(--crimson-500))]" />
                  <h3 className="text-[hsl(var(--teal-800))] dark:text-[hsl(var(--teal-200))] font-medium">{step.year}</h3>
                  <p className="text-muted-foreground">{step.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-10 prose prose-neutral dark:prose-invert">
          <h2>Principles</h2>
          <ul>
            {PRINCIPLES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
