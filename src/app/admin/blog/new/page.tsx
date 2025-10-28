import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";
import { requirePermission } from "@/lib/auth/server";

import { NewBlogPostEditor } from "./_components/new-blog-post-editor";

export const metadata: Metadata = {
  title: "New Blog Post",
};

export default async function NewBlogPostPage() {
  const actor = await requirePermission("audit:read");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="New Blog Post">
        <NewBlogPostEditor />
      </AdminShell>
    </PageShell>
  );
}
