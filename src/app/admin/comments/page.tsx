import Link from "next/link";

import type { CommentStatus } from "@/lib/supabase/service";
import { fetchModerationQueue } from "@/lib/moderation/comments";

import { ModerationQueue } from "./_components/moderation-queue";

interface CommentsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const STATUS_OPTIONS: { value: CommentStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
  { value: "all", label: "All" },
];

function parseStatus(raw: string | undefined): CommentStatus | "all" {
  if (!raw) {
    return "pending";
  }

  const option = STATUS_OPTIONS.find((item) => item.value === raw);
  return option ? option.value : "pending";
}

function parsePage(raw: string | undefined): number {
  if (!raw) {
    return 1;
  }

  const page = Number.parseInt(raw, 10);
  if (!Number.isFinite(page) || page <= 0) {
    return 1;
  }

  return page;
}

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  const status = parseStatus(typeof searchParams?.status === "string" ? searchParams.status : undefined);
  const page = parsePage(typeof searchParams?.page === "string" ? searchParams.page : undefined);
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined;

  const queue = await fetchModerationQueue({ status, page, search });

  const baseUrl = new URL("/admin/comments", "http://localhost");

  return (
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <div className="u-stack u-gap-2xl">
        <section className="u-stack u-gap-lg">
          <div className="u-flex u-flex-wrap u-gap-sm" role="tablist" aria-label="Status filters">
            {STATUS_OPTIONS.map((option) => {
              const url = new URL(baseUrl);
              if (option.value !== "pending") {
                url.searchParams.set("status", option.value);
              }
              if (search) {
                url.searchParams.set("search", search);
              }

              const isActive = status === option.value;
              return (
                <Link
                  key={option.value}
                  role="tab"
                  aria-selected={isActive}
                  className={`badge ${isActive ? "badge--primary" : "badge--ghost"}`}
                  href={url.pathname + url.search}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>

          <form className="u-flex u-gap-sm" method="get" action="/admin/comments">
            <input type="hidden" name="status" value={status} />
            <input
              type="search"
              name="search"
              className="input"
              placeholder="Search by author, email, slug, or content"
              defaultValue={search ?? ""}
            />
            <button type="submit" className="button">Search</button>
          </form>

          <p className="u-text-sm u-text-muted">
            Showing {queue.items.length} of {queue.totalCount} comments{status !== "all" ? ` in ${status} status` : ""}.
          </p>
        </section>

        <ModerationQueue
          initialItems={queue.items}
          page={page}
          status={status}
          search={search ?? ""}
          hasNextPage={queue.hasNextPage}
          hasPreviousPage={queue.hasPreviousPage}
          pageSize={queue.pageSize}
          totalCount={queue.totalCount}
        />
      </div>
    </div>
  );
}
