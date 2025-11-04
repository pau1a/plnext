"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const PHOTO = "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

const PINS = [
  {
    id: 0,
    x: "22%",
    y: "18%",
    label: "Optimist",
    title: "Post-mortem in one hour",
    body: "Instrumentation made the narrative data-first; execs got clarity, engineers got rest.",
  },
  {
    id: 1,
    x: "68%",
    y: "46%",
    label: "Engineer",
    title: "Guardrail saved the day",
    body: "Drift flagged early; rollout paused; lineage traced; safe fix shipped.",
  },
  {
    id: 2,
    x: "40%",
    y: "78%",
    label: "Adventurer",
    title: "Quiet on-call",
    body: "Alerts crisp; recovery unremarkable. Exploration hardened the system.",
  },
] as const;

export default function Page() {
  const [open, setOpen] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const popoverMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: 0.2 },
      };

  return (
    <main className="pb-16 md:pb-24">
      <section className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight max-w-3xl">Building calm in complex systems</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
          The three words are not a slogan — they’re a map. Tap a pin to see how each shows up in real work.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1.4fr] md:items-start">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <Image src={PHOTO} alt="Paula Livingstone" fill className="object-cover" sizes="(min-width: 1024px) 28rem, (min-width: 768px) 24rem, 100vw" />
            {PINS.map((pin) => {
              const isOpen = open === pin.id;

              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => setOpen(isOpen ? null : pin.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 text-xs font-medium text-white bg-[hsl(var(--crimson-500))] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--crimson-500))]"
                  style={{ left: pin.x, top: pin.y }}
                >
                  {pin.label}
                </button>
              );
            })}
            <AnimatePresence>
              {PINS.filter((pin) => pin.id === open).map((pin) => (
                <motion.div
                  key={pin.id}
                  className="absolute z-10 w-64 md:w-72 rounded-xl p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur ring-1 ring-black/5 dark:ring-white/10"
                  style={{ left: pin.x, top: pin.y, transform: "translate(-50%, calc(-50% - 12px))" }}
                  {...popoverMotion}
                >
                  <h4 className="font-semibold">{pin.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{pin.body}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>From RF to AI-secured automation</h2>
            <p>
              My career began in military radio and satellite systems and matured through large-scale IP networking. Today I focus on
              AI-enabled operations for industrial environments. I design layered defences, instrument estates so risk is measured not
              guessed, and remove toil with code so teams can focus on the hard problems.
            </p>
            <p>
              I shape security by design for OT and automation programmes and align controls to recognised standards such as IEC 62443.
              I am the person teams tap to untangle cross-discipline problems when they cut across layers and refuse to fit into one box.
            </p>
            <p>
              Over the past year I have gone deep on Python-first machine learning and modern data tooling. I build guardrails that let
              models survive contact with production, including secure MLOps, model and data lineage, drift detection, and adversarial
              robustness.
            </p>
            <h2>Constants</h2>
            <ul>
              <li>Narrow the blast radius</li>
              <li>Increase visibility</li>
              <li>Shorten recovery</li>
              <li>Keep people out of headlines</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
