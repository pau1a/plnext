import React from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PostCard } from "@/components/post-card";
import type { BlogPostSummary } from "@/lib/mdx";

function buildSummary(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
  return {
    slug: "example-post",
    title: "Example Post",
    description: "An example description.",
    date: "2024-01-01T00:00:00.000Z",
    tags: ["example"],
    ...overrides,
  } satisfies BlogPostSummary;
}

beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = "";
    readonly thresholds = [] as ReadonlyArray<number>;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      void callback;
      void options;
    }

    disconnect(): void {}

    observe(target: Element): void {
      void target;
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }

    unobserve(target: Element): void {
      void target;
    }
  }

  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
});

describe("PostCard", () => {
  it("renders a zero comment label", () => {
    render(<PostCard summary={buildSummary()} commentCount={0} />);

    const countLabel = screen.getByLabelText("0 comments");
    expect(countLabel).toBeInTheDocument();
    expect(countLabel).toHaveTextContent("0 comments");
  });

  it("renders plural comment labels", () => {
    render(<PostCard summary={buildSummary({ slug: "second" })} commentCount={5} />);

    const countLabel = screen.getByLabelText("5 comments");
    expect(countLabel).toBeInTheDocument();
  });

  it("hides the comment label when the count is unavailable", () => {
    render(<PostCard summary={buildSummary({ slug: "third" })} commentCount={null} />);

    expect(screen.queryByLabelText(/comments/)).toBeNull();
  });
});
