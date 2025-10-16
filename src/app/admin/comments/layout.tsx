import type { Metadata } from "next";

import { AdminShell } from "@/app/admin/_components/admin-shell";
import { requirePermission } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Comment moderation",
};

interface CommentsLayoutProps {
  children: React.ReactNode;
}

export default async function CommentsLayout({ children }: CommentsLayoutProps) {
  const actor = await requirePermission("comments:moderate");

  return <AdminShell actor={actor} title="Comment moderation">{children}</AdminShell>;
}
