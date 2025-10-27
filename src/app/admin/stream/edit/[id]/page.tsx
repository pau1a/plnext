import Link from "next/link";
import { requirePermission } from "@/lib/auth/server";
import { parseJSONL } from "@/lib/stream";
import { StreamEntryForm } from "../../_components/stream-entry-form";
import path from "node:path";

const STREAM_FILE = path.join(process.cwd(), "content", "stream", "stream.jsonl");

export default async function EditStreamEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("audit:read");
  const { id: encodedId } = await params;
  const id = decodeURIComponent(encodedId);

  const records = await parseJSONL(STREAM_FILE);
  const entry = records.find((r) => r.id === id);

  if (!entry) {
    return (
      <div className="u-stack u-gap-lg">
        <div className="u-flex u-justify-between u-items-start u-gap-sm">
          <div>
            <h1 className="u-text-2xl u-font-semibold">Stream Entry Not Found</h1>
            <p>The stream entry with ID {id} could not be found.</p>
          </div>
          <Link href="/admin/stream" className="button button--ghost button--sm">
            ← Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="u-stack u-gap-lg">
      <div className="u-flex u-justify-between u-items-start u-gap-sm">
        <div>
          <h1 className="u-text-2xl u-font-semibold">Edit Stream Entry</h1>
          <p className="u-text-muted u-text-sm">Editing entry {id}</p>
        </div>
        <Link href="/admin/stream" className="button button--ghost button--sm">
          ← Back to List
        </Link>
      </div>
      <StreamEntryForm entry={entry} />
    </div>
  );
}
