"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHOTO = "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
  const heroMotion = useMemo(
    () => ({
      variants: fadeUp,
      initial: shouldReduceMotion ? undefined : "hidden",
      animate: shouldReduceMotion ? undefined : "show",
    }),
    [shouldReduceMotion],
  );

  return (
    <main className="pb-16 md:pb-24">
      <section className="relative w-full bg-[radial-gradient(110%_110%_at_18%_28%,hsl(var(--teal-300))_0%,transparent_55%)] dark:bg-[radial-gradient(110%_110%_at_18%_28%,hsl(var(--teal-400))_0%,transparent_55%)]">
        <div className="container mx-auto max-w-6xl px-4 pt-8 md:pt-14 pb-10 md:pb-12 lg:pr-[420px]">
          <motion.p {...heroMotion} className="text-xs md:text-sm tracking-widest text-muted-foreground mb-2">
            ABOUT
          </motion.p>
          <motion.h1 {...heroMotion} className="text-4xl md:text-6xl font-semibold leading-tight">
            Building calm in complex systems
          </motion.h1>
          <motion.p
            {...heroMotion}
            className="mt-2 text-sm md:text-base tracking-[0.25em] text-muted-foreground uppercase"
          >
            Optimist&nbsp;|&nbsp;Engineer&nbsp;|&nbsp;Adventurer
          </motion.p>
          <motion.p {...heroMotion} className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            I am an engineer who helps build and secure automated systems and the interconnected networks that run them. My focus
            is where operational technology, networks, and AI-enabled automation overlap. My job is to narrow the blast radius.
          </motion.p>

          <motion.div {...heroMotion} className="mt-6 md:mt-8">
            <div className="mx-auto max-w-5xl relative overflow-hidden rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:ring-white/10 px-5 md:px-0 py-5">
              <div aria-hidden className="absolute inset-y-0 left-0 w-3 bg-[hsl(var(--teal-500))] dark:bg-[hsl(var(--teal-600))]" />
              <div className="md:pl-8 lg:pl-10">
                <ul className="grid gap-3 md:grid-cols-3 text-sm md:text-[15px] leading-relaxed">
                  <li>
                    <strong>MSc (Cyber) · MIEE</strong> — measurement-led engineering.
                  </li>
                  <li>
                    <strong>OT · networks · AI automation</strong> — one blast radius, layered defence.
                  </li>
                  <li>
                    <strong>Python-first ML &amp; secure MLOps</strong> — lineage, drift, robustness.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...heroMotion}
          className="hidden md:block absolute right-[min(5vw,48px)] -bottom-20 lg:-bottom-24 w-[320px] lg:w-[360px]"
        >
          <div className="relative rounded-2xl overflow-hidden ring-2 ring-[hsl(var(--crimson-500))] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Paula Livingstone" className="h-full w-full object-cover aspect-[4/5]" loading="lazy" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 [box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 mt-20 md:mt-28 prose prose-neutral dark:prose-invert max-w-none">
        <h2>From RF to AI-secured automation</h2>
        {BIOGRAPHY.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </main>
  );
}
