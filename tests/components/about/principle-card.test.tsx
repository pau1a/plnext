import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { PrincipleCard } from "@/components/about/PrincipleCard";

describe("PrincipleCard", () => {
  const title = "Narrow the blast radius";
  const body = "Design for safe failure. Isolate. Contain. Make incidents small and boring.";

  it("renders the provided title and body", () => {
    render(<PrincipleCard title={title} body={body} />);

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText(body)).toBeInTheDocument();
  });

  it("matches the snapshot", () => {
    const { container } = render(<PrincipleCard title={title} body={body} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("passes basic accessibility checks", async () => {
    const { container } = render(<PrincipleCard title={title} body={body} />);

    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
