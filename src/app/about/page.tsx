import type { Metadata } from "next";
import AboutPageContent from "./about-content";

const BADGES = [
  "Industrial automation",
  "AI security",
  "OT & networks",
  "Python-first",
  "Measurement-led",
] as const;

const BIOGRAPHY = [
  "My career began in military radio and satellite systems and matured through large-scale IP networking. Today I focus on AI-enabled operations for industrial environments. I design layered defences, instrument estates so risk is measured not guessed, and remove toil with code so teams can focus on the hard problems.",
  "I shape security by design for OT and automation programmes and align controls to recognised standards such as IEC 62443. I am the person teams tap to untangle cross-discipline problems when they cut across layers and refuse to fit into one box.",
  "Over the past year I have gone deep on Python-first machine learning and modern data tooling. I build guardrails that let models survive contact with production, including secure MLOps, model and data lineage, drift detection, and adversarial robustness.",
  "Postgraduate study sharpened the theory. I hold an MSc Cyber Security and a PGDip Cyber. My dissertation explored how cryptographic transparency and distributed ledgers can strengthen identity and provenance across industrial supply chains. Applied cryptography is part of the toolbox. I use signatures, attestations and transparency logs, with blockchain only where it reduces risk and friction for integrity, provenance and tamper-evident logging.",
  "My operating style is measurement-led. Results look like lower MTTR, fewer false positives, safer change windows and quieter on-call. I prefer simple, observable architectures to clever, brittle ones. Controls and infrastructure should be code. Runbooks should be testable. Recovery should be unremarkable.",
  "Earlier in my journey I founded an AI venture and chose to wind it down when the stack was not ready. That experience sharpened timing and judgement and reinforced a bias for pragmatic engineering.",
] as const;

const PRINCIPLES = [
  {
    title: "Narrow the blast radius",
    body: "Design for safe failure. Isolate. Contain. Make incidents small and boring.",
  },
  {
    title: "Increase visibility",
    body: "Instrument the estate. Measure risk rather than guess it. Logs that tell the truth.",
  },
  {
    title: "Shorten recovery",
    body: "Lower MTTR with clear runbooks, good alerts, and tested recovery paths.",
  },
  {
    title: "Keep people out of headlines",
    body: "Protect teams and users by making systems resilient and decisions auditable.",
  },
] as const;

const CLOSING_STATEMENT =
  "If the future is AI and automation, it needs engineers who can secure it end to end. That is my lane.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Paula Livingstone",
  jobTitle: "Engineer, Industrial Cybersecurity",
  image: "https://cdn.networklayer.co.uk/paulalivingstone/images/plprof.jpeg",
  url: `${siteUrl}/about`,
  inLanguage: "en-GB",
} as const;

export const metadata: Metadata = {
  title: "About | Paula Livingstone",
  description:
    "Industrial automation and AI security. Narrow the blast radius, increase visibility, shorten recovery.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | Paula Livingstone",
    description:
      "Industrial automation and AI security. Narrow the blast radius, increase visibility, shorten recovery.",
    url: `${siteUrl}/about`,
    type: "profile",
    images: [
      {
        url: `${siteUrl}/window.svg`,
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Paula Livingstone",
    description:
      "Industrial automation and AI security. Narrow the blast radius, increase visibility, shorten recovery.",
    images: [`${siteUrl}/window.svg`],
  },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }} />
      <AboutPageContent
        badges={BADGES}
        biography={BIOGRAPHY}
        principles={PRINCIPLES}
        closingStatement={CLOSING_STATEMENT}
      />
    </>
  );
}
