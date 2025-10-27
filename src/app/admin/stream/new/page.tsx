import Link from "next/link";
import { requirePermission } from "@/lib/auth/server";
import { StreamEntryForm } from "../_components/stream-entry-form";

export default async function NewStreamEntryPage() {
  await requirePermission("audit:read");

  return (
    <div className="u-stack u-gap-lg">
      <div className="u-flex u-justify-between u-items-start u-gap-sm">
        <div>
          <h1 className="u-text-2xl u-font-semibold">Create New Stream Entry</h1>
          <p className="u-text-muted u-text-sm">Add a new entry to your stream</p>
        </div>
        <Link href="/admin/stream" className="button button--ghost button--sm">
          ← Back to List
        </Link>
      </div>
      <StreamEntryForm />
    </div>
  );
}
