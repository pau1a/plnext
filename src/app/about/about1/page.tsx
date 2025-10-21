"use client";

import { motion, useReducedMotion } from "framer-motion";

const WORDS = ["Optimist", "Engineer", "Adventurer"] as const;
const COLORS = [
  "text-[hsl(var(--teal-800))] dark:text-[hsl(var(--teal-200))]",
  "text-[hsl(var(--crimson-600))] dark:text-[hsl(var(--crimson-400))]",
  "text-foreground",
] as const;

export default function Page() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="pb-16 md:pb-24">
      <section className="relative w-full bg-[radial-gradient(110%_110%_at_18%_28%,hsl(var(--teal-300))_0%,transparent_55%)] dark:bg-[radial-gradient(110%_110%_at_18%_28%,hsl(var(--teal-400))_0%,transparent_55%)]">
        <div className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14 pb-8">
          <p className="text-xs md:text-sm tracking-widest text-muted-foreground mb-3">ABOUT</p>

          <div className="space-y-2 md:space-y-3">
            {WORDS.map((word, index) => {
              const headingMotion = shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 18 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.05 * index, duration: 0.45, ease: "easeOut" },
                  };

              const letterMotion = shouldReduceMotion
                ? {}
                : { whileHover: { y: -4 }, transition: { type: "spring", stiffness: 250, damping: 18 } };

              return (
                <motion.h1
                  key={word}
                  className={[
                    "font-semibold leading-none",
                    "text-[14vw] md:text-[6rem] lg:text-[7rem]",
                    "tracking-tight",
                    COLORS[index],
                  ].join(" ")}
                  {...headingMotion}
                >
                  <span className="inline-block">
                    {word.split("").map((character, characterIndex) => (
                      <motion.span key={characterIndex} className="inline-block" {...letterMotion}>
                        {character}
                      </motion.span>
                    ))}
                  </span>
                </motion.h1>
              );
            })}
          </div>

          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
            I help build and secure automated systems and the interconnected networks that run them. OT, networks and AI-enabled
            automation share one blast radius. My job is to narrow it.
          </p>
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
        <p>
          Earlier in my journey I founded an AI venture and chose to wind it down when the stack was not ready. That experience
          sharpened timing and judgement and reinforced a bias for pragmatic engineering.
        </p>
      </section>
    </main>
  );
}
