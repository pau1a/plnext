import type { Metadata } from "next";
import Link from "next/link";

import styles from "./about.module.scss";

const PORTRAIT_URL =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

const PRINCIPLES = [
  {
    title: "Narrow the blast radius.",
    description:
      "Segment every control plane and fail closed so incidents stay contained.",
  },
  {
    title: "Increase visibility.",
    description: "Measure the estate continuously and surface gaps before users do.",
  },
  {
    title: "Shorten recovery.",
    description:
      "Drill the response paths and automate rollback until recovery is routine.",
  },
  {
    title: "Keep people and processes out of the headlines.",
    description:
      "Design procedures and guardrails that protect both operators and outcomes.",
  },
] as const;

const PHASES = [
  {
    heading: "RF and Satellite Systems",
    paragraphs: [
      "Paula maintains RF discipline from satellite ground segment integration and defence radio programmes.",
      "She calculates link budgets, supervises spectrum compliance, and proves telemetry paths end to end before deployment.",
    ],
  },
  {
    heading: "Networks at Scale",
    paragraphs: [
      "She architects IP backbones and OT networks that stay observable under change windows and peak load.",
      "She scripts configuration baselines, validates failover in staged labs, and documents runbooks that operations teams execute without escalation.",
    ],
  },
  {
    heading: "Industrial AI and Cryptography",
    paragraphs: [
      "Paula secures machine learning pipelines for industrial automation with signed artefacts, lineage tracking, and adversarial testing.",
      "She applies cryptography pragmatically, selecting attestations and transparency logs where they reduce risk and audit time.",
    ],
  },
  {
    heading: "Measurement and Simplicity",
    paragraphs: [
      "She instruments systems so metrics, traces, and logs tell a consistent story that engineers can act on immediately.",
      "She removes ornate architecture, favouring simple components that teams can rehearse, recover, and explain under pressure.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "About | Paula Livingstone",
  description:
    "Optimist. Engineer. Adventurer. Paula Livingstone designs dependable automation and security systems.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-hero-title">
        <div className={styles.heroInner}>
          <h1 id="about-hero-title" className={styles.heroTitle}>
            Optimist. Engineer. Adventurer.
          </h1>
          <p className={styles.heroSubtitle}>
            Paula Livingstone designs dependable automation and security systems for industrial operations.
          </p>
        </div>
      </section>

      <section className={styles.profile} aria-labelledby="profile-summary">
        <div className={styles.profileMedia}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PORTRAIT_URL} alt="Paula Livingstone" loading="lazy" />
        </div>
        <div className={styles.profileCopy}>
          <h2 id="profile-summary" className={styles.profileHeading}>
            Profile
          </h2>
          <p>
            Paula leads engineering programmes that bring order to complex infrastructure and the software wrapped around it.
          </p>
          <p>
            She aligns firmware, network, and platform teams around measured interfaces that hold under load.
          </p>
          <p>
            She rehearses incident response and change control until calm recovery is the standard outcome.
          </p>
        </div>
      </section>

      <section className={styles.narrative} aria-labelledby="career-narrative">
        <div className={styles.narrativeInner}>
          <h2 id="career-narrative" className={styles.narrativeHeading}>
            Practice
          </h2>
          <article className={styles.narrativeColumn}>
            {PHASES.map((phase) => (
              <section key={phase.heading} className={styles.phase}>
                <h3 className={styles.phaseHeading}>{phase.heading}</h3>
                {phase.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="constants-heading">
        <div className={styles.principlesInner}>
          <h2 id="constants-heading" className={styles.principlesHeading}>
            Constants
          </h2>
          <div className={styles.principlesGrid}>
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className={styles.principleCard}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleDescription}>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-note">
        <div className={styles.closingInner}>
          <p id="closing-note" className={styles.closingStatement}>
            I design systems that stay calm when the environment does not.
          </p>
          <Link className={styles.contactLink} href="/contact">
            Contact Paula
          </Link>
        </div>
      </section>
    </main>
  );
}
