import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import styles from "./dashboard.module.scss";

export const metadata: Metadata = {
  title: "Admin dashboard",
};

const WIDGETS = [
  {
    title: "Traffic overview",
    description: "Reserved space for analytics summary",
    size: "wide" as const,
  },
  {
    title: "Recent activity",
    description: "Stream of latest comments, submissions, or alerts",
  },
  {
    title: "Content pipeline",
    description: "Upcoming publishing queue or draft status",
  },
  {
    title: "Operations checklist",
    description: "Infra health, open incidents, change log items",
  },
  {
    title: "Team notes",
    description: "Links, reminders, or shared annotations",
  },
] as const;

export default async function AdminDashboardPage() {
  const actor = await requirePermission("comments:view");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Operations dashboard">
        <section aria-label="Dashboard widget placeholders" className={styles.grid}>
          {WIDGETS.map((widget) => (
            <article
              className={`${styles.widget} ${widget.size === "wide" ? styles.gridWide : ""}`}
              key={widget.title}
            >
              <header className={styles.widgetHeader}>
                <p className={styles.widgetTitle}>{widget.title}</p>
                <p className={styles.widgetHint}>{widget.description}</p>
              </header>
              <div className={styles.placeholder}>Widget placeholder</div>
            </article>
          ))}
        </section>

        <section style={{ marginTop: "var(--space-xl)", paddingTop: "var(--space-lg)", borderTop: "1px solid var(--surface-border)" }}>
          <h2 className="u-heading-sm u-font-semibold" style={{ marginBottom: "var(--space-sm)" }}>
            Quick Links
          </h2>
          <ul className="u-stack u-gap-2xs">
            <li>
              <Link href="/admin/settings/analytics" className="u-link">
                Analytics Settings → Configure Google Analytics 4
              </Link>
            </li>
          </ul>
        </section>
      </AdminShell>
    </PageShell>
  );
}
