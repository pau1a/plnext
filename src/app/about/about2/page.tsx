"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHOTO = "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";
const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
} as const;

const BIOGRAPHY = [
  "My career began in military radio and satellite systems and matured through large-scale IP networking. Today I focus on AI-enabled operations for industrial environments. I design layered defences, instrument estates so risk is measured not guessed, and remove toil with code so teams can focus on the hard problems.",
  "I shape security by design for OT and automation programmes and align controls to recognised standards such as IEC 62443. I am the person teams tap to untangle cross-discipline problems when they cut across layers and refuse to fit into one box.",
  "Over the past year I have gone deep on Python-first machine learning and modern data tooling. I build guardrails that let models survive contact with production, including secure MLOps, model and data lineage, drift detection, and adversarial robustness.",
  "Postgraduate study sharpened the theory. I hold an MSc Cyber Security and a PGDip Cyber. My dissertation explored how cryptographic transparency and distributed ledgers can strengthen identity and provenance across industrial supply chains. Applied cryptography is part of the toolbox. I use signatures, attestations and transparency logs, with blockchain only where it reduces risk and friction for integrity, provenance and tamper-evident logging.",
  "My operating style is measurement-led. Results look like lower MTTR, fewer false positives, safer change windows and quieter on-call. I prefer simple, observable architectures to clever, brittle ones. Controls and infrastructure should be code. Runbooks should be testable. Recovery should be unremarkable.",
  "Earlier in my journey I founded an AI venture and chose to wind it down when the stack was not ready. That experience sharpened timing and judgement and reinforced a bias for pragmatic engineering.",
] as const;

export default function Page() {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = useMemo(
    () => ({
      variants: fade,
      initial: shouldReduceMotion ? undefined : "hidden",
      animate: shouldReduceMotion ? undefined : "show",
    }),
    [shouldReduceMotion],
  );

  return (
    <main className="pb-16 md:pb-24">
      <section className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <motion.p {...motionProps} className="text-xs md:text-sm tracking-widest text-muted-foreground mb-2">
              ABOUT
            </motion.p>
            <motion.h1 {...motionProps} className="text-4xl md:text-6xl font-semibold leading-tight">
              Building calm in complex systems
            </motion.h1>
            <motion.div {...motionProps} className="mt-2">
              <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-[hsl(var(--teal-700))] dark:text-[hsl(var(--teal-300))]">
                Optimist | Engineer | Adventurer
              </p>
              <div className="h-[2px] w-28 bg-[hsl(var(--crimson-500))] mt-1" />
            </motion.div>
            <motion.p {...motionProps} className="mt-4 text-base md:text-lg text-muted-foreground max-w-prose">
              I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My focus
              is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast radius.
            </motion.p>
          </div>
          <motion.div
            {...motionProps}
            className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-2 ring-[hsl(var(--crimson-500))]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Paula Livingstone" className="aspect-[4/5] w-full object-cover" loading="lazy" />
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 mt-10 prose prose-neutral dark:prose-invert max-w-none">
        <h2>From RF to AI-secured automation</h2>
        {BIOGRAPHY.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </main>
  );
}
