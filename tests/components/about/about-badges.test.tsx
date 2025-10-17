import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { AboutBadges } from "@/components/about/AboutBadges";

describe("AboutBadges", () => {
  const labels = [
    "Industrial automation",
    "AI security",
    "OT & networks",
  ];

  it("renders each provided badge label", () => {
    render(<AboutBadges labels={labels} />);

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("matches the snapshot", () => {
    const { container } = render(<AboutBadges labels={labels} />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<AboutBadges labels={labels} />);

    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
