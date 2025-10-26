import { requirePermission } from "@/lib/auth/server";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";

export default async function CommentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await requirePermission("comments:moderate");

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Comment moderation">
        {children}
      </AdminShell>
    </PageShell>
  );
}