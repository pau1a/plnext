import type { Metadata } from "next";
import Link from "next/link";

import styles from "./about.module.scss";

const PORTRAIT_URL =
  "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg";

const PRINCIPLES = [
  {
    title: "Narrow the blast radius.",
    description:
      "Partition control paths and prefer defaults that fail closed so disruption stays local.",
  },
  {
    title: "Increase visibility.",
    description:
      "Instrument services and links continuously so drift is caught before customers notice.",
  },
  {
    title: "Shorten recovery.",
    description:
      "Exercise rollback and incident drills until the response is practiced, quick, and quiet.",
  },
  {
    title: "Keep people and processes out of the headlines.",
    description:
      "Design operations that protect both operators and outcomes with measured guardrails.",
  },
] as const;

const PHASES = [
  {
    heading: "RF and Satellite Systems",
    paragraphs: [
      "Paula integrates ground stations and tactical radio networks with disciplined RF engineering.",
      "She calculates link budgets, validates spectral compliance, and closes telemetry paths before launch windows open.",
    ],
  },
  {
    heading: "Networks at Scale",
    paragraphs: [
      "She shapes IP and OT topologies that remain observable under change control and peak demand.",
      "She scripts configuration baselines, proves redundancy in staged environments, and documents runbooks operations teams follow without escalation.",
    ],
  },
  {
    heading: "Industrial AI and Cryptography",
    paragraphs: [
      "Paula secures automation platforms where machine learning, robotics, and humans meet on the factory floor.",
      "She enforces signed artefacts, audit trails, and pragmatic cryptography so safety cases stand up to regulators.",
    ],
  },
  {
    heading: "Measurement and Simplicity",
    paragraphs: [
      "She instruments services so metrics, traces, and logs align to a single operational story.",
      "She removes ornamental complexity, leaving components teams can rehearse, recover, and explain under pressure.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "About | Paula Livingstone",
  description:
    "Optimist. Engineer. Adventurer. Paula Livingstone builds calm, observable systems across infrastructure and automation.",
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
            Building calm in complex systems through secure automation and measured networks.
          </p>
        </div>
      </section>

      <section className={styles.summary} aria-labelledby="profile-summary">
        <div className={styles.summaryPortrait}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PORTRAIT_URL} alt="Paula Livingstone" loading="lazy" />
        </div>
        <div className={styles.summaryCopy}>
          <h2 id="profile-summary" className={styles.summaryTitle}>
            Profile summary
          </h2>
          <p>
            Paula stabilises RF, network, and automation estates that cannot afford silence or surprise. She unifies firmware,
            infrastructure, and software teams through measured interfaces and rehearsed procedures. She keeps AI-enabled control
            systems auditable so operators trust them in production.
          </p>
        </div>
      </section>

      <section className={styles.narrative} aria-labelledby="career-narrative">
        <div className={styles.narrativeInner}>
          <h2 id="career-narrative" className={styles.narrativeLabel}>
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
          <h2 id="constants-heading" className={styles.principlesTitle}>
            Constants
          </h2>
          <div className={styles.principlesGrid}>
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className={styles.principleCard}>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-note">
        <div className={styles.closingInner}>
          <p id="closing-note" className={styles.closingStatement}>
            The work is simple: keep critical systems composed when everything around them is not.
          </p>
          <Link className={styles.contactLink} href="/contact">
            Contact Paula
          </Link>
        </div>
      </section>
    </main>
  );
}
