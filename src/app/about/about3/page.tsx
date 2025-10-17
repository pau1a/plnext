"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
} as const;

const BIOGRAPHY = [
  "My career began in military radio and satellite systems and matured through large-scale IP networking. Today I focus on AI-enabled operations for industrial environments. I design layered defences, instrument estates so risk is measured not guessed, and remove toil with code so teams can focus on the hard problems.",
  "I shape security by design for OT and automation programmes and align controls to recognised standards such as IEC 62443. I am the person teams tap to untangle cross-discipline problems when they cut across layers and refuse to fit into one box.",
  "Over the past year I have gone deep on Python-first machine learning and modern data tooling. I build guardrails that let models survive contact with production, including secure MLOps, model and data lineage, drift detection, and adversarial robustness.",
  "Postgraduate study sharpened the theory. I hold an MSc Cyber Security and a PGDip Cyber. My dissertation explored how cryptographic transparency and distributed ledgers can strengthen identity and provenance across industrial supply chains. Applied cryptography is part of the toolbox. I use signatures, attestations and transparency logs, with blockchain only where it reduces risk and friction for integrity, provenance and tamper-evident logging.",
  "My operating style is measurement-led. Results look like lower MTTR, fewer false positives, safer change windows and quieter on-call. I prefer simple, observable architectures to clever, brittle ones. Controls and infrastructure should be code. Runbooks should be testable. Recovery should be unremarkable.",
  "Earlier in my journey I founded an AI venture and chose to wind it down when the stack was not ready. That experience sharpened timing and judgement and reinforced a bias for pragmatic engineering.",
] as const;

const PRINCIPLES = [
  "Narrow the blast radius",
  "Increase visibility",
  "Shorten recovery",
  "Keep people out of headlines",
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
      <section className="container mx-auto max-w-3xl px-4 pt-12 md:pt-16">
        <motion.p {...motionProps} className="text-xs tracking-[0.35em] text-muted-foreground uppercase">
          Optimist | Engineer | Adventurer
        </motion.p>
        <motion.h1 {...motionProps} className="mt-2 text-4xl md:text-5xl font-semibold leading-tight">
          Building calm in complex systems
        </motion.h1>
        <motion.p {...motionProps} className="mt-4 text-base md:text-lg text-muted-foreground">
          I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My focus
          is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast radius.
        </motion.p>
      </section>

      <section className="container mx-auto max-w-3xl px-4 mt-10 prose prose-neutral dark:prose-invert">
        <h2>From RF to AI-secured automation</h2>
        {BIOGRAPHY.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <h2>Constants</h2>
        <ul>
          {PRINCIPLES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          <em>
            If the future is AI and automation, it needs engineers who can secure it end to end. That is my lane.
          </em>
        </p>
      </section>
    </main>
  );
}
