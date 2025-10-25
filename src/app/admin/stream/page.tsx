import path from "node:path";
import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";
import { parseJSONL } from "@/lib/stream";
import { resolveTagSlugs } from "@/lib/tags";

import { StreamEditor } from "./stream-editor";

const STREAM_FILE_PATH = path.join(process.cwd(), "content", "stream", "stream.jsonl");

export const metadata: Metadata = {
  title: "Stream",
};

export default async function AdminStreamPage() {
  const actor = await requirePermission("audit:read");
  const rawEntries = await parseJSONL(STREAM_FILE_PATH);

  const entries = rawEntries.map((entry) => ({
    ...entry,
    visibility: entry.visibility ?? "PRIVATE",
    tags: resolveTagSlugs(entry.tags ?? []).tags,
  }));

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Stream">
        <StreamEditor entries={entries} />
      </AdminShell>
    </PageShell>
  );
}
