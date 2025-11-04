"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  { word: "Optimist", text: "Bias toward better futures. Calm by design." },
  { word: "Engineer", text: "Measurement-led, layered, standards-aligned." },
  { word: "Adventurer", text: "Curiosity under constraints; real-world guardrails." },
] as const;

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.8", "end 0.2"] });
  const progressHeight = useTransform(scrollYProgress, [0, 1], [0, 320]);

  return (
    <main className="pb-16 md:pb-24">
      <section ref={containerRef} className="container mx-auto max-w-5xl px-4 pt-10 md:pt-14">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">Building calm in complex systems</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground">A career plotted along three cardinal markers.</p>

        <div className="relative mt-8">
          <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-[hsl(var(--teal-300))]" />
          <motion.div
            className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 w-[2px] bg-[hsl(var(--crimson-500))]"
            style={{ height: shouldReduceMotion ? "100%" : progressHeight }}
          />
          <ul className="space-y-10 md:space-y-14">
            {STEPS.map((step, index) => {
              const itemMotion = shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 12 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.3 },
                    transition: { duration: 0.35, delay: index * 0.05 },
                  };

              return (
                <motion.li key={step.word} className="relative md:w-1/2 md:mx-auto" {...itemMotion}>
                  <span className="absolute -left-3 md:-left-4 top-1 h-3 w-3 rounded-full bg-[hsl(var(--crimson-500))]" />
                  <h3
                    className={[
                      "text-2xl font-semibold",
                      step.word === "Optimist" && "text-[hsl(var(--teal-800))] dark:text-[hsl(var(--teal-200))]",
                      step.word === "Engineer" && "text-foreground",
                      step.word === "Adventurer" && "text-[hsl(var(--crimson-600))] dark:text-[hsl(var(--crimson-400))]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {step.word}
                  </h3>
                  <p className="text-muted-foreground">{step.text}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
