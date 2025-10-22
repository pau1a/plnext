import clsx from "clsx";
import Link from "next/link";

import elevatedSurfaceStyles from "@/components/elevated-surface.module.scss";
import DevSectionOverlay from "@/components/DevSectionOverlay";
import Hero from "@/components/hero";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { ProjectCard } from "@/components/project-card";
import { getProjectSummaries } from "@/lib/mdx";

import styles from "@/styles/home.module.scss";

const services = [
  {
    icon: "fa-shield-halved",
    title: "Security architecture sprints",
    description:
      "Design pragmatic zero-trust blueprints that unblock delivery without compromising coverage.",
    bullets: [
      "Model identity-first network segmentation and threat paths",
      "Embed compliance guardrails directly inside CI/CD",
      "Translate board-level risk statements into technical work",
    ],
  },
  {
    icon: "fa-microchip",
    title: "AI & automation enablement",
    description:
      "Ship AI-assisted workflows responsibly with strong observability, testing, and human-in-the-loop controls.",
    bullets: [
      "Operationalize model monitoring and safety instrumentation",
      "Integrate privacy and data retention policies into pipelines",
      "Prototype copilots that accelerate analysts instead of replacing them",
    ],
  },
  {
    icon: "fa-diagram-project",
    title: "Resilient platform engineering",
    description:
      "Strengthen the infrastructure foundation powering customer-facing experiences and mission-critical tooling.",
    bullets: [
      "Automate incident response runbooks and learning loops",
      "Eliminate single points of failure in multi-cloud environments",
      "Coach teams on durable DevSecOps habits that stick",
    ],
  },
];

const approach = [
  {
    title: "Discover & align",
    description:
      "Rapid workshops expose constraints, stakeholders, and existing telemetry so we can calibrate ambitions to reality.",
  },
  {
    title: "Design & validate",
    description:
      "Lightweight architecture narratives, attack simulations, and prototypes de-risk the path before heavy investment.",
  },
  {
    title: "Deliver & empower",
    description:
      "Paired implementation, clear documentation, and coaching ensure teams can own the solution long after the engagement.",
  },
];

const proofPoints = [
  {
    value: "15+",
    label: "years across regulated platforms",
    description: "From aerospace telemetry to fintech compliance programs.",
  },
  {
    value: "120%",
    label: "increase in audit readiness",
    description:
      "Automation that turned quarterly fire drills into routine push-button reports.",
  },
  {
    value: "9/10",
    label: "teams stay on as ongoing partners",
    description:
      "Long-term relationships built on clarity, trust, and measurable wins.",
  },
];

export default async function Home() {
  const projects = await getProjectSummaries();
  const featuredProjects = projects.slice(0, 2);

  return (
    <>
      <Hero
        copy={{
          eyebrow: "Fractional security leadership",
          title: "Build fearless software for regulated teams",
          subheading:
            "Architecture, automation, and assurance from one hands-on partner",
          description:
            "I help engineering orgs translate compliance into actionable guardrails, ship AI capabilities safely, and keep operations resilient when everything is on the line.",
        }}
        ctas={[
          {
            label: "See recent work",
            href: "/projects",
            icon: (
              <i className="fa-solid fa-diagram-project" aria-hidden="true" />
            ),
          },
          {
            label: "Schedule a call",
            href: "/contact",
            variant: "ghost",
            icon: <i className="fa-solid fa-message" aria-hidden="true" />,
          },
        ]}
      />

      <PageShell as="main" className={styles.page} data-dev-shell="home">
        <DevSectionOverlay />
        <MotionFade>
          <section
            className={styles.section}
            aria-labelledby="services-heading"
            data-home-section
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>
                How we can work together
              </span>
              <h2 id="services-heading" className={styles.sectionTitle}>
                Services designed to untangle complex delivery
              </h2>
              <p className={styles.sectionDescription}>
                Strategic direction meets sleeves-rolled-up execution. Each
                engagement blends architecture, automation, and change
                management so teams can move fast without leaving security
                behind.
              </p>
            </div>
            <div className={styles.serviceGrid}>
              {services.map((service) => (
                <article
                  key={service.title}
                  className={clsx(
                    elevatedSurfaceStyles.elevatedSurface,
                    styles.serviceCard,
                  )}
                >
                  <span className={styles.serviceIcon} aria-hidden="true">
                    <i className={clsx("fa-solid", service.icon)} />
                  </span>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>
                  <ul className={styles.serviceList}>
                    {service.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </MotionFade>

        <MotionFade delay={0.05}>
          <section
            className={styles.section}
            aria-labelledby="approach-heading"
            data-home-section
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Engagement rhythm</span>
              <h2 id="approach-heading" className={styles.sectionTitle}>
                A deliberate, no-drama delivery cadence
              </h2>
              <p className={styles.sectionDescription}>
                Every project follows an intentionally lightweight cadence that
                keeps stakeholders aligned and decisions auditable without
                drowning teams in ceremony.
              </p>
            </div>
            <ol className={styles.approachList}>
              {approach.map((step, index) => (
                <li key={step.title} className={styles.approachItem}>
                  <span className={styles.stepNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </li>
              ))}
            </ol>
          </section>
        </MotionFade>

        <MotionFade delay={0.1}>
          <section
            className={styles.section}
            aria-labelledby="projects-heading"
            data-home-section
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Recent wins</span>
              <h2 id="projects-heading" className={styles.sectionTitle}>
                Case studies from the field
              </h2>
              <p className={styles.sectionDescription}>
                From breach simulations to intelligence automation, here are a
                few ways we have helped teams stay ahead of attackers while
                keeping velocity high.
              </p>
            </div>
            <div className={styles.projectsGrid}>
              {featuredProjects.map((project) => (
                <ProjectCard key={project.slug} summary={project} />
              ))}
            </div>
            <div className={styles.sectionFooter}>
              <Link className={styles.sectionLink} href="/projects">
                View all projects
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link className={styles.sectionLink} href="/contact">
                Start a project conversation
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </MotionFade>

        <MotionFade delay={0.15}>
          <section
            className={styles.section}
            aria-labelledby="proof-heading"
            data-home-section
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Proof points</span>
              <h2 id="proof-heading" className={styles.sectionTitle}>
                Outcomes that stakeholders feel immediately
              </h2>
              <p className={styles.sectionDescription}>
                The combination of engineering leadership, security depth, and
                product empathy means programs mature quickly and sustainably.
              </p>
            </div>
            <div className={styles.metricsGrid}>
              {proofPoints.map((metric) => (
                <article key={metric.label} className={styles.metric}>
                  <p className={styles.metricValue}>{metric.value}</p>
                  <p className={styles.metricLabel}>{metric.label}</p>
                  <p className={styles.metricDescription}>
                    {metric.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </MotionFade>

        <MotionFade delay={0.2}>
          <section
            className={clsx(styles.section, styles.ctaSection)}
            aria-labelledby="cta-heading"
            data-home-section
          >
            <div className={styles.ctaCard}>
              <div>
                <h2 id="cta-heading" className={styles.ctaTitle}>
                  Ready to give your team breathing room?
                </h2>
                <p className={styles.ctaDescription}>
                  Let’s co-design a focused engagement that protects what
                  matters most while unlocking the speed your roadmap demands.
                </p>
              </div>
              <div className={styles.ctaActions}>
                <Link
                  className="button button--primary button--lg"
                  href="/contact"
                >
                  Book an intro call
                </Link>
                <Link className="button button--ghost button--lg" href="/about">
                  Learn more about me
                </Link>
              </div>
            </div>
          </section>
        </MotionFade>
      </PageShell>
    </>
  );
}
