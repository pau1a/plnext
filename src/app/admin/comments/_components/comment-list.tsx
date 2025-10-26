import { cache } from "react";

import type { Comment } from "@/lib/comments/comment";
import { fetchModerationQueue } from "@/lib/moderation/comments";
import type { ModerationQueueItem } from "@/lib/moderation/comments";

import { CommentListClient } from "./comment-list-client";

interface QueueResult {
  items: ModerationQueueItem[];
  error: string | null;
}

const loadQueue = cache(async (): Promise<QueueResult> => {
  try {
    const result = await fetchModerationQueue({ status: "all", page: 1, pageSize: 50 });
    return { items: result.items, error: null };
  } catch (error) {
    console.error("Unable to fetch moderation queue", error);
    const message =
      error instanceof Error && error.message === "SUPABASE_SERVICE_ENV_MISSING"
        ? "Supabase service credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable moderation."
        : error instanceof Error && error.message
        ? error.message
        : "Unable to load comments.";
    return { items: [], error: message };
  }
});

function mapToComment(item: ModerationQueueItem): Comment {
  return {
    id: item.id,
    slug: item.slug,
    author: {
      name: item.authorName,
      email: item.authorEmail,
    },
    body: item.content,
    createdAt: item.createdAt,
    status: item.status,
  };
}

export async function CommentList() {
  const { items, error } = await loadQueue();
  const comments = items.map((item) => mapToComment(item));

  return <CommentListClient initialComments={comments} error={error} />;
}
