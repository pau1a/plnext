import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

import { MDXComponents } from "@/components/mdx/MDXComponents";
import { getPhilosophy } from "@/lib/philosophy";

import styles from "./philosophy.module.scss";

export const metadata = {
  title: "Philosophy | Paula Livingstone",
  description: "Guiding principles for engineering and design.",
  alternates: { canonical: "/philosophy" },
};

export default async function PhilosophyPage() {
  const { meta, content } = await getPhilosophy();

  const updatedLabel =
    typeof meta?.updated === "string"
      ? new Date(meta.updated).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  const principles = [
    {
      title: "Risk",
      summary: "Start with credible exposure, contain the blast radius, and design around reality, not hypotheticals.",
      href: "#risk",
    },
    {
      title: "Resilience",
      summary: "Favour rehearsed recovery paths and humane operations so shocks don’t burn out the team.",
      href: "#resilience",
    },
    {
      title: "Simplicity",
      summary: "Complexity is unpaid debt. Collapse layers, explain architectures clearly, and prefer calm runbooks.",
      href: "#simplicity",
    },
    {
      title: "Measurement",
      summary: "Trust the data. Pair every objective with signals so improvements are proven, not wished into existence.",
      href: "#measurement",
    },
  ];

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Operating code</p>
            <h1 className={styles.heroTitle}>Engineering philosophy</h1>
            {updatedLabel ? <p className={styles.heroMeta}>Updated {updatedLabel}</p> : null}
            {meta?.summary ? <p className={styles.heroSummary}>{meta.summary}</p> : null}
          </div>

          <div className={styles.intentGridWrapper}>
            <div className={styles.intentGrid}>
              {principles.map((principle) => (
                <Link key={principle.title} href={principle.href} className={styles.intentCard}>
                  <span className={styles.intentCardLabel}>{principle.title}</span>
                  <p className={styles.intentCardBody}>{principle.summary}</p>
                  <span aria-hidden className={styles.intentCardHint}>Explore ↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.content}>
          <aside className={styles.navColumn}>
            <div className={styles.navHeader}>Navigate</div>
            <nav className={styles.navList}>
              {principles.map((principle) => (
                <Link key={principle.title} href={principle.href} className={styles.navItem}>
                  <span className={styles.navItemLabel}>{principle.title}</span>
                  <span className={styles.navItemBody}>{principle.summary}</span>
                </Link>
              ))}
            </nav>

            <div className={styles.promiseCard}>
              <p className={styles.promiseLabel}>Promise</p>
              <p className={styles.promiseBody}>
                Calm, observable systems that let people sleep. If a decision threatens that goal, it does not ship.
              </p>
            </div>
          </aside>

          <div className={styles.proseWrapper}>
            <div className={styles.prose}>
              <MDXRemote source={content} components={MDXComponents} />
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerLabel}>Continue exploring</span>
          <Link className={styles.footerLinkTeal} href="/writing">
            Writing
          </Link>
          <Link className={styles.footerLinkCrimson} href="/notes">
            Notes
          </Link>
          <Link className={styles.footerLinkSlate} href="/projects">
            Projects
          </Link>
        </footer>
      </div>
    </article>
  );
}
