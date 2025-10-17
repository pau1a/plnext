"use client";

import { motion, useReducedMotion } from "framer-motion";

const REPEAT = 10;

type RowProps = {
  text: string;
  reverse?: boolean;
  reduceMotion: boolean;
};

function Row({ text, reverse = false, reduceMotion }: RowProps) {
  const animationProps = reduceMotion
    ? { initial: false }
    : {
        initial: { x: reverse ? "-10%" : "10%" },
        animate: { x: reverse ? "10%" : "-10%" },
        transition: { duration: 18, repeat: Infinity, ease: "linear" },
      };

  return (
    <motion.div {...animationProps} className="whitespace-nowrap">
      {Array.from({ length: REPEAT }).map((_, index) => (
        <span key={index} className="mx-6 opacity-90">
          {text}
        </span>
      ))}
    </motion.div>
  );
}

export default function Page() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="pb-16 md:pb-24">
      <section className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_30%,hsl(var(--teal-300)/0.25)_0%,transparent_60%)]" />
        <div className="px-4 md:px-8 py-10 md:py-14 relative">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">Building calm in complex systems</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Optimist | Engineer | Adventurer — as moving lines, not a slogan: optimism (top), engineering (middle), adventure
            (bottom).
          </p>
        </div>

        <div className="relative py-6 bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
          <div className="overflow-hidden border-y border-black/5 dark:border-white/10">
            <Row text="Optimist" reduceMotion={shouldReduceMotion} />
          </div>
          <div className="overflow-hidden border-b border-black/5 dark:border-white/10">
            <Row text="Engineer" reverse reduceMotion={shouldReduceMotion} />
          </div>
          <div className="overflow-hidden">
            <Row text="Adventurer" reduceMotion={shouldReduceMotion} />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 mt-10 prose prose-neutral dark:prose-invert max-w-none">
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
        <p>
          Postgraduate study sharpened the theory. I hold an MSc Cyber Security and a PGDip Cyber. My dissertation explored how
          cryptographic transparency and distributed ledgers can strengthen identity and provenance across industrial supply chains.
          Applied cryptography is part of the toolbox. I use signatures, attestations and transparency logs, with blockchain only
          where it reduces risk and friction for integrity, provenance and tamper-evident logging.
        </p>
        <p>
          My operating style is measurement-led. Results look like lower MTTR, fewer false positives, safer change windows and
          quieter on-call. I prefer simple, observable architectures to clever, brittle ones. Controls and infrastructure should be
          code. Runbooks should be testable. Recovery should be unremarkable.
        </p>
        <h2>Constants</h2>
        <ul>
          <li>Narrow the blast radius</li>
          <li>Increase visibility</li>
          <li>Shorten recovery</li>
          <li>Keep people out of headlines</li>
        </ul>
        <p>
          <em>If the future is AI and automation, it needs engineers who can secure it end to end. That is my lane.</em>
        </p>
      </section>
    </main>
  );
}
