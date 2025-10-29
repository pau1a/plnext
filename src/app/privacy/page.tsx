import { getPrivacy } from "@/lib/privacy";

import styles from "./privacy.module.scss";

export const metadata = {
  title: "Privacy Policy | Paula Livingstone",
  description: "How this site handles data, cookies, and third parties.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-static";

const privacySections = [
  {
    title: "Data Collected",
    content: "We do not collect personal data when you browse this site. Server logs capture only ephemeral diagnostic details (like error traces) that are automatically purged and never linked to identifiable visitors.",
  },
  {
    title: "Cookies",
    content: "No tracking or advertising cookies are set. The site only uses essential cookies required for security or authentication when you explicitly sign in.",
  },
  {
    title: "Third Parties",
    content: "We do not embed third-party analytics, ads, or social media pixels. Infrastructure providers process traffic solely to deliver this website.",
  },
  {
    title: "Contact",
    content: "Questions about privacy can be sent to privacy@paulalivingstone.com. Responses typically arrive within a few business days.",
  },
  {
    title: "Changes",
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
    <article className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Data practices</p>
            <h1 className={styles.heroTitle}>{meta?.title ?? "Privacy Policy"}</h1>
            {updatedDate ? (
              <p className={styles.heroMeta}>Last updated {updatedDate}</p>
            ) : null}
            <p className={styles.heroSummary}>
              {meta?.summary ?? "How this site handles data, cookies, and third parties."}
            </p>
          </div>
        </section>

        <section className={styles.content}>
          {privacySections.map((section) => (
            <article key={section.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionText}>{section.content}</p>
            </article>
          ))}
        </section>

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
      </div>
    </article>
  );
}
