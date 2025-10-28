import { requirePermission } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/categories";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import PageShell from "@/components/layout/PageShell";

import { CategoryList } from "./_components/category-list";

export default async function CategoriesPage() {
  const actor = await requirePermission("audit:read");
  const categories = getAllCategories();

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <AdminShell actor={actor} title="Categories">
        <p className="u-text-muted u-text-sm" style={{ marginBottom: "1rem" }}>
          Categories provide high-level organization for content. Each piece of content should
          belong to one category (e.g., Technical, Personal).
        </p>
        <CategoryList categories={categories} />
      </AdminShell>
    </PageShell>
  );
}
