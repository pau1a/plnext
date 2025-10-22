"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CommentStatus } from "@/lib/supabase/service";
import type { ModerationQueueItem } from "@/lib/moderation/comments";

import { handleModerationAction } from "../actions";

type ModerationAction = "approve" | "reject";

interface ModerationQueueProps {
  initialItems: ModerationQueueItem[];
  status: CommentStatus | "all";
  page: number;
  search: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
  totalCount: number;
}

interface ItemState extends ModerationQueueItem {
  pendingAction: ModerationAction | null;
  error: string | null;
}

function createInitialState(items: ModerationQueueItem[]): ItemState[] {
  return items.map((item) => ({ ...item, pendingAction: null, error: null }));
}

function buildPageUrl(params: { status: string; search: string; page: number }): string {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "pending") {
    searchParams.set("status", params.status);
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.page > 1) {
    searchParams.set("page", String(params.page));
  }
  const query = searchParams.toString();
  return `/admin/comments${query ? `?${query}` : ""}`;
}

export function ModerationQueue({
  initialItems,
  status,
  page,
  search,
  hasNextPage,
  hasPreviousPage,
  pageSize,
  totalCount,
}: ModerationQueueProps) {
  const router = useRouter();
  const [items, setItems] = useState<ItemState[]>(() => createInitialState(initialItems));
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(createInitialState(initialItems));
  }, [initialItems]);

  const queueEmpty = items.length === 0;

  const pageDescription = useMemo(() => {
    if (totalCount === 0) {
      return "0 of 0";
    }
    const resolvedPageSize = Math.max(pageSize, 1);
    const pageStart = (page - 1) * resolvedPageSize + 1;
    const pageEnd = pageStart + items.length - 1;
    return `${pageStart}-${Math.max(pageStart, pageEnd)} of ${totalCount}`;
  }, [page, items.length, totalCount, pageSize]);

  const disabled = isPending;

  async function runAction(item: ItemState, action: ModerationAction) {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, pendingAction: action, error: null } : entry,
      ),
    );

    const formData = new FormData();
    formData.set("commentId", item.id);
    formData.set("slug", item.slug);
    formData.set("action", action);
    const reasonValue = reasons[item.id]?.trim();
    if (reasonValue) {
      formData.set("reason", reasonValue);
    }

    startTransition(() => {
      handleModerationAction(formData)
        .then((result) => {
          if (!result.ok) {
            setItems((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, pendingAction: null, error: result.error ?? "Failed" } : entry,
              ),
            );
            return;
          }

          setItems((prev) => prev.filter((entry) => entry.id !== item.id));
          setReasons((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
          router.refresh();
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "Failed";
          setItems((prev) =>
            prev.map((entry) =>
              entry.id === item.id ? { ...entry, pendingAction: null, error: message } : entry,
            ),
          );
        });
    });
  }

  return (
    <section className="u-stack u-gap-xl">
      <header className="u-flex u-items-center u-justify-between">
        <h2 className="u-text-2xl u-font-semibold">Queue</h2>
        <span className="u-text-sm u-text-muted">{pageDescription}</span>
      </header>

      {queueEmpty ? (
        <p className="u-text-muted" role="status">
          No comments match this filter.
        </p>
      ) : (
        <ul className="u-stack u-gap-xl">
          {items.map((item) => (
            <li key={item.id} className="u-stack u-gap-md">
              <div className="u-stack u-gap-xs">
                <div className="u-flex u-justify-between u-items-start">
                  <div>
                    <h3 className="u-text-lg u-font-semibold">{item.authorName}</h3>
                    <p className="u-text-sm u-text-muted">{item.authorEmail ?? "No email provided"}</p>
                  </div>
                  <span className="badge badge--outline">{item.status}</span>
                </div>
                <p className="u-text-base u-leading-relaxed whitespace-pre-wrap">{item.content}</p>
                <dl className="u-grid u-grid-cols-2 u-gap-sm u-text-xs u-text-muted">
                  <div>
                    <dt>Slug</dt>
                    <dd>{item.slug}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{new Date(item.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>IP hash</dt>
                    <dd>{item.ipHash}</dd>
                  </div>
                  <div>
                    <dt>User agent</dt>
                    <dd>{item.userAgent ?? "Unknown"}</dd>
                  </div>
                </dl>
              </div>

              <label className="u-stack u-gap-sm">
                <span className="u-text-sm u-font-medium">Moderation notes (optional)</span>
                <textarea
                  className="input"
                  name={`reason-${item.id}`}
                  rows={2}
                  value={reasons[item.id] ?? ""}
                  onChange={(event) =>
                    setReasons((prev) => ({ ...prev, [item.id]: event.target.value.slice(0, 280) }))
                  }
                  placeholder="Add context for the audit log"
                />
              </label>

              {item.error ? <p className="u-text-sm u-text-error">{item.error}</p> : null}

              <div className="u-flex u-gap-sm">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={disabled || item.pendingAction !== null}
                  onClick={() => runAction(item, "approve")}
                >
                  {item.pendingAction === "approve" ? "Approving…" : "Approve"}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={disabled || item.pendingAction !== null}
                  onClick={() => runAction(item, "reject")}
                >
                  {item.pendingAction === "reject" ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="u-flex u-gap-sm u-justify-between" aria-label="Pagination controls">
        <a
          className={`button button--ghost ${!hasPreviousPage ? "is-disabled" : ""}`}
          aria-disabled={!hasPreviousPage}
          href={hasPreviousPage ? buildPageUrl({ status, search, page: page - 1 }) : "#"}
        >
          Previous
        </a>
        <a
          className={`button button--ghost ${!hasNextPage ? "is-disabled" : ""}`}
          aria-disabled={!hasNextPage}
          href={hasNextPage ? buildPageUrl({ status, search, page: page + 1 }) : "#"}
        >
          Next
        </a>
      </footer>
    </section>
  );
}
