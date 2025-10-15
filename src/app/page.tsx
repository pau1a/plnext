import Hero from "@/components/hero";

export default function Home() {
  return (
    <Hero
      copy={{
        eyebrow: "Practical builds",
        title: "Cybersecurity, AI, Engineering",
        subheading: "Pragmatic delivery for complex systems",
        description:
          "From zero-trust architecture to AI-assisted operations, I help security-conscious teams ship reliable software that scales.",
      }}
      ctas={[
        {
          label: "View Projects",
          href: "/projects",
          icon: <i className="fa-solid fa-diagram-project" aria-hidden="true" />,
        },
        {
          label: "Get in touch",
          href: "/contact",
          variant: "ghost",
          icon: <i className="fa-solid fa-message" aria-hidden="true" />,
        },
      ]}
      images={{
        horizontal: {
          src: "/hero-horizontal.svg",
          alt: "Abstract aerospace trajectories representing systems in freefall.",
          width: 1440,
          height: 720,
        },
        vertical: {
          src: "/hero-vertical.svg",
          alt: "Vertical mission control scene with guided landing vectors.",
          width: 960,
          height: 1280,
        },
      }}
    />
  );
}
