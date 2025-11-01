import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { LibraryItemForm } from "./library-item-form";

export const metadata: Metadata = {
  title: "Add Library Item | Admin",
  description: "Add books, essays, talks, and papers to your curated library.",
};

export default async function AdminLibraryNewPage() {
  const actor = await requirePermission("audit:read");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell
        actor={actor}
        title="Add library item"
        subtitle="Curate the books, essays, talks, and papers that shaped your thinking."
      >
        <div className="u-flex u-gap-sm u-items-center u-flex-wrap">
          <Link className="button button--ghost button--xs" href="/admin/library">
            ← Back to library
          </Link>
        </div>

        <LibraryItemForm />
      </AdminShell>
    </PageShell>
  );
}
