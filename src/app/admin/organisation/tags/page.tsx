import { requirePermission } from "@/lib/auth/server";
import { getAllTags } from "@/lib/tags";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";

import { TagList } from "./_components/tag-list";

export default async function TagsPage() {
  const actor = await requirePermission("audit:read");
  const tags = getAllTags();

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Tags">
        <p className="u-text-muted u-text-sm" style={{ marginBottom: "1rem" }}>
          Tags help readers discover related content across categories. Content can have multiple
          tags (e.g., application-security, devsecops, ai).
        </p>
        <TagList tags={tags} />
      </AdminShell>
    </PageShell>
  );
}
