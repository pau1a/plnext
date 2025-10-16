import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { CommentProvider } from "@/components/comment-context";

function renderComments(slug = "hello-world") {
  return render(
    <CommentProvider slug={slug}>
      <CommentForm slug={slug} />
      <CommentList slug={slug} />
    </CommentProvider>,
  );
}

describe("Comment form and list", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders pagination controls and loads additional pages", async () => {
    const firstPage = {
      comments: [
        {
          id: "1",
          author: "Alice",
          body: "First!",
          createdAt: new Date("2024-01-01T12:00:00Z").toISOString(),
        },
      ],
      nextCursor: "2024-01-01T12:00:00Z",
    };
    const secondPage = {
      comments: [
        {
          id: "2",
          author: "Bob",
          body: "Second!",
          createdAt: new Date("2024-01-01T12:05:00Z").toISOString(),
        },
      ],
      nextCursor: null,
    };

    const fetchMock = vi
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(firstPage), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(secondPage), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    const user = userEvent.setup();
    renderComments();

    await screen.findByText("First!");

    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    await user.click(loadMoreButton);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("slug=hello-world"),
      expect.objectContaining({ cache: "no-store" }),
    );
    const [, lastInit] = fetchMock.mock.calls.at(-1) ?? [];
    const lastUrl = fetchMock.mock.calls.at(-1)?.[0];
    expect(typeof lastUrl).toBe("string");
    if (typeof lastUrl === "string") {
      expect(decodeURIComponent(lastUrl)).toContain("after=2024-01-01T12:00:00Z");
    }
    expect(lastInit).toEqual(expect.objectContaining({ cache: "no-store" }));

    await screen.findByText("Second!");
  });

  it("shows optimistic updates while a comment submission is in flight", async () => {
    const fetchMock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ comments: [], nextCursor: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    let resolvePost: ((value: Response) => void) | null = null;
    const postPromise = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });

    fetchMock.mockImplementationOnce(async () => postPromise);

    global.fetch = fetchMock as unknown as typeof fetch;

    const user = userEvent.setup();
    renderComments();

    await screen.findByText(/no comments yet/i);

    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText("Comment", { selector: "textarea" }), "This is excellent.");

    const submitButtons = screen.getAllByRole("button", { name: /post comment/i });
    const submitButton = submitButtons.find((button) => !button.hasAttribute("disabled")) ?? submitButtons[0];
    await user.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const pendingMessage = await screen.findByText("Submitting your comment…", undefined, {
      timeout: 3_000,
    });
    expect(pendingMessage).toBeInTheDocument();

    resolvePost?.(
      new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("Thanks! Your comment is awaiting moderation."),
      ).toBeInTheDocument(),
    );

  });

  it("provides accessible labels and status messaging", async () => {
    const fetchMock = vi
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ comments: [], nextCursor: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    renderComments();

    const nameField = await screen.findByLabelText(/name/i);
    const emailField = screen.getByLabelText(/email/i);
    const commentField = screen.getByRole("textbox", { name: /comment/i });

    expect(nameField).toHaveAttribute("type", "text");
    expect(emailField).toHaveAttribute("type", "email");
    expect(commentField.tagName.toLowerCase()).toBe("textarea");

    const form = nameField.closest("form");
    expect(form).not.toBeNull();
    const statusRegion = within(form!).getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");

    const emptyStates = screen.getAllByText(/no comments yet/i);
    expect(emptyStates.length).toBeGreaterThan(0);
    expect(emptyStates[0].closest("div")).toHaveAttribute("role", "status");
  });
});
