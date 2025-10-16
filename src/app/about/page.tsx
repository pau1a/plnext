import type { Metadata } from "next";

const commitments = [
  "Design guardrails that let product teams move quickly without compromising auditability.",
  "Translate complex risk narratives into clear choices for executives and engineers.",
  "Pair automation with human review so decisions stay accountable.",
] as const;

const highlights = [
  {
    label: "Current focus",
    value: "Securing AI-enabled platforms for regulated scale-ups in fintech and aerospace.",
  },
  {
    label: "Recent impact",
    value: "Stabilised incident response at a Series C company, cutting mean time to recovery by 42%.",
  },
  {
    label: "Toolbox",
    value: "Zero-trust architecture, privacy-first telemetry, resilience testing, and AI workflow design.",
  },
] as const;

const ethosStatements = [
  "Safety is a design constraint, not an afterthought.",
  "Clarity beats theatre—especially under pressure.",
] as const;

export const metadata: Metadata = {
  title: "About Paula Livingstone",
  description:
    "Cybersecurity and applied AI leader helping teams ship resilient systems with confidence and speed.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Paula Livingstone",
    description:
      "Cybersecurity and applied AI leader helping teams ship resilient systems with confidence and speed.",
    url: "/about",
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    title: "About Paula Livingstone",
    description:
      "Cybersecurity and applied AI leader helping teams ship resilient systems with confidence and speed.",
    images: ["/window.svg"],
  },
};

export default function About() {
  return (
    <article className="u-stack u-gap-2xl u-max-w-lg u-center">
      <header className="u-stack u-gap-sm">
        <p className="u-text-xs u-text-uppercase u-text-muted">About</p>
        <h1 className="heading-display-lg">Building calm in complex systems</h1>
        <p className="u-text-lead">
          I lead cyber, reliability, and AI programmes that keep critical platforms trustworthy even when the environment is
          changing faster than the roadmap.
        </p>
      </header>

      <section className="u-stack u-gap-md" aria-labelledby="about-story-heading">
        <h2 id="about-story-heading" className="heading-section">
          Field-tested leadership
        </h2>
        <p>
          Over the past 15 years I have worked across threat intelligence, security operations, and platform engineering—most
          recently guiding cross-functional teams as Chief Security Officer for high-growth organisations. My remit spans risk
          governance, product security, and the automation that binds them together.
        </p>
        <p>
          I am at my best partnering with founders and engineering leads who need security to accelerate, not obstruct, their
          mission. That means shaping strategy, coaching teams, and shipping the tooling that keeps commitments real.
        </p>
      </section>

      <section className="surface u-pad-xl u-stack u-gap-md" aria-labelledby="about-highlights-heading">
        <h2 id="about-highlights-heading" className="heading-subtitle">
          At-a-glance
        </h2>
        <dl className="u-stack u-gap-sm" aria-label="Professional highlights">
          {highlights.map((item) => (
            <div key={item.label} className="u-stack-2xs">
              <dt className="u-text-xs u-text-uppercase u-text-muted">{item.label}</dt>
              <dd className="u-m-0">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="u-stack u-gap-md" aria-labelledby="about-ethos-heading">
        <h2 id="about-ethos-heading" className="heading-section">
          Ethos
        </h2>
        <div className="u-stack u-gap-sm" role="list">
          {ethosStatements.map((statement) => (
            <blockquote key={statement} className="surface u-pad-lg u-text-lg" role="listitem">
              <p className="u-m-0">“{statement}”</p>
            </blockquote>
          ))}
        </div>
        <h3 className="heading-subtitle">Practice commitments</h3>
        <ul className="u-stack u-gap-xs">
          {commitments.map((commitment) => (
            <li key={commitment}>{commitment}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
