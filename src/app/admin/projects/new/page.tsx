import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { NewProjectEditor } from "./_components/new-project-editor";

export const metadata: Metadata = {
  title: "New Project",
};

export default async function NewProjectPage() {
  const actor = await requirePermission("audit:read");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="New Project">
        <NewProjectEditor />
      </AdminShell>
    </PageShell>
  );
}
