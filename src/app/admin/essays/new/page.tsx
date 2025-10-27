import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { NewEssayEditor } from "./_components/new-essay-editor";

export const metadata: Metadata = {
  title: "New Essay",
};

export default async function NewEssayPage() {
  const actor = await requirePermission("audit:read");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="New Essay">
        <NewEssayEditor />
      </AdminShell>
    </PageShell>
  );
}
