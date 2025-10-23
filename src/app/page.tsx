import DevSectionOverlay from "@/components/DevSectionOverlay";
import Hero from "@/components/home/Hero";
import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import AboutCapsule from "@/components/home/AboutCapsule";
import NowExcerpt from "@/components/home/NowExcerpt";
import NotesPreview from "@/components/home/NotesPreview";
import ProjectPreview from "@/components/home/ProjectPreview";
import StreamPreview from "@/components/home/StreamPreview";
import WritingPreview from "@/components/home/WritingPreview";

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
        <div className={styles.sectionStack}>
          <MotionFade>
            <AboutCapsule />
          </MotionFade>
          <MotionFade delay={0.05} duration={0.25} offset={20}>
            <WritingPreview />
          </MotionFade>
          <MotionFade delay={0.1}>
            <NotesPreview />
          </MotionFade>
          <MotionFade delay={0.15}>
            <StreamPreview />
          </MotionFade>
          <MotionFade delay={0.2}>
            <ProjectPreview />
          </MotionFade>
          <MotionFade delay={0.25}>
            <NowExcerpt />
          </MotionFade>
        </div>
      </PageShell>
      <DevSectionOverlay />
    </div>
  );
}
