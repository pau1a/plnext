import { Suspense } from "react";

import { CommentList } from "./_components/comment-list";
import { CommentListLoading } from "./_components/comment-list-loading";

export default function CommentAdminDashboard() {
  return (
    <Suspense fallback={<CommentListLoading />}>
      <CommentList />
    </Suspense>
  );
}