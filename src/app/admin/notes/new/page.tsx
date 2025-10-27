import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { NewNoteEditor } from "./_components/new-note-editor";

export const metadata: Metadata = {
  title: "New Note",
};

export default async function NewNotePage() {
  const actor = await requirePermission("audit:read");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="New Note">
        <NewNoteEditor />
      </AdminShell>
    </PageShell>
  );
}
