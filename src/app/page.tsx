import Hero from "@/components/home/Hero";
import PageShell from "@/components/layout/PageShell";
import AboutCapsule from "@/components/home/AboutCapsule";
import SignalLayer from "@/components/home/SignalLayer";
import KnowledgeLayer from "@/components/home/KnowledgeLayer";
import ExecutionLayer from "@/components/home/ExecutionLayer";
import ContinuityLayer from "@/components/home/ContinuityLayer";
import MotionFade from "@/components/motion/MotionFade";

import styles from "@/styles/home.module.scss";
export default function Home() {
  return (
    <div className={styles.home} data-dev-shell="home">
      <Hero
        data-home-hero
        copy={{
          eyebrow: "Optimist | Engineer | Adventurer",
          title: "Building fearless systems in a fragile world.",
          subheading:
            "From industrial automation to AI security, I work where reliability meets risk.",
          description:
            "I shape systems that stay composed when it counts — translating complex requirements into the confidence to operate and evolve safely.",
        }}
        ctas={[
          {
            label: "Explore my work",
            href: "/projects",
            icon: (
              <i className="fa-solid fa-diagram-project" aria-hidden="true" />
            ),
          },
          {
            label: "Read latest notes",
            href: "/notes",
            variant: "ghost",
            icon: <i className="fa-solid fa-book" aria-hidden="true" />,
          },
        ]}
      />

      <PageShell as="main" className={styles.main} fullWidth>
        <div className={styles.strata}>
          <MotionFade>
            <AboutCapsule />
          </MotionFade>
          <SignalLayer />
          <MotionFade>
            <ContinuityLayer />
          </MotionFade>
          <KnowledgeLayer />
          <ExecutionLayer />
        </div>
      </PageShell>
    </div>
  );
}
