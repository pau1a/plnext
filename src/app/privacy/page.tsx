import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { getPrivacy } from "@/lib/privacy";
import PrivacySection from "./PrivacySection";

export const metadata = {
  title: "Privacy Policy",
  description: "How this site handles data, cookies, and third parties.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-static";

const privacySections = [
  {
    title: "Data Collected",
    icon: "fa-database",
    content: "We do not collect personal data when you browse this site. Server logs capture only ephemeral diagnostic details (like error traces) that are automatically purged and never linked to identifiable visitors.",
  },
  {
    title: "Cookies",
    icon: "fa-cookie-bite",
    content: "No tracking or advertising cookies are set. The site only uses essential cookies required for security or authentication when you explicitly sign in.",
  },
  {
    title: "Third Parties",
    icon: "fa-share-nodes",
    content: "We do not embed third-party analytics, ads, or social media pixels. Infrastructure providers process traffic solely to deliver this website.",
  },
  {
    title: "Contact",
    icon: "fa-envelope",
    content: "Questions about privacy can be sent to privacy@paulalivingstone.com. Responses typically arrive within a few business days.",
  },
  {
    title: "Changes",
    icon: "fa-clock-rotate-left",
    content: "If our data practices change, this page will be updated with a clear summary and revision date.",
  },
];

export default async function PrivacyPage() {
  const { meta } = await getPrivacy();

  const updatedDate = meta?.updated
    ? new Date(meta.updated).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <MotionFade>
        <article className="u-stack u-gap-2xl">
          <header className="u-stack u-gap-sm u-text-center">
            <h1 className="u-heading-lg u-font-semibold">
              {meta?.title ?? "Privacy Policy"}
            </h1>
            {updatedDate ? (
              <time className="u-text-sm u-text-muted" dateTime={String(meta.updated)}>
                Last updated {updatedDate}
              </time>
            ) : null}
            {meta?.summary ? (
              <p className="u-text-muted u-text-lg u-max-w-prose u-mx-auto">{meta.summary}</p>
            ) : null}
          </header>

          <div className="privacy-grid">
            {privacySections.map((section) => (
              <PrivacySection
                key={section.title}
                title={section.title}
                icon={section.icon}
                content={section.content}
              />
            ))}
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "PrivacyPolicy",
                name: "Privacy Policy",
                url: process.env.NEXT_PUBLIC_SITE_URL
                  ? `${process.env.NEXT_PUBLIC_SITE_URL}/privacy`
                  : "/privacy",
                dateModified: meta?.updated || undefined,
              }),
            }}
          />
        </article>
      </MotionFade>
    </PageShell>
  );
}
