import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { AnalyticsSettingsForm } from "./analytics-settings-form";
import { getAnalyticsSettingsAction } from "./actions";

export const metadata: Metadata = {
  title: "Analytics Settings | Admin",
  description: "Configure Google Analytics 4 and other analytics integrations.",
};

export default async function AnalyticsSettingsPage() {
  const actor = await requirePermission("audit:read");
  const settings = await getAnalyticsSettingsAction();

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Analytics Settings" subtitle="Configure tracking and measurement integrations.">
        <div className="u-stack u-gap-xl">
          <section className="u-stack u-gap-md">
            <div>
              <h2 className="u-heading-md u-font-semibold">Google Analytics 4</h2>
              <p className="u-text-sm u-text-muted" style={{ marginTop: "var(--space-2xs)" }}>
                Configure GA4 tracking for your site. Changes take effect immediately without requiring a rebuild.
              </p>
            </div>

            <AnalyticsSettingsForm initialSettings={settings} />
          </section>

          <section className="u-stack u-gap-sm" style={{ paddingTop: "var(--space-lg)", borderTop: "1px solid var(--surface-border)" }}>
            <h3 className="u-heading-sm u-font-semibold">Resources</h3>
            <ul className="u-stack u-gap-2xs u-text-sm">
              <li>
                <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="u-link">
                  Google Analytics Dashboard ↗
                </a>
              </li>
              <li>
                <Link href="/admin" className="u-link">
                  ← Back to Admin Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="https://support.google.com/analytics/answer/9304153"
                  target="_blank"
                  rel="noreferrer"
                  className="u-link u-text-muted"
                >
                  GA4 Setup Guide ↗
                </a>
              </li>
            </ul>
          </section>
        </div>
      </AdminShell>
    </PageShell>
  );
}
