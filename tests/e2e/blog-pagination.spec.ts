import { expect, test } from "@playwright/test";

test.describe("blog pagination", () => {
  test("navigates forward and backward across cursor pages", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Operations Deep Dive" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Newer posts" })).toHaveCount(0);
    await expect(page.locator("nav").getByText("Newer posts")).toHaveAttribute("aria-disabled", "true");

    const olderLink = page.getByRole("link", { name: "Older posts" });
    await expect(olderLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\?after=/),
      olderLink.click(),
    ]);

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Secure Baselines" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Older posts" })).toHaveCount(0);
    await expect(page.locator("nav").getByText("Older posts")).toHaveAttribute("aria-disabled", "true");

    const newerLink = page.getByRole("link", { name: "Newer posts" });
    await expect(newerLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\?before=/),
      newerLink.click(),
    ]);

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Operations Deep Dive" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Older posts" })).toBeVisible();
  });

  test("returns 404 for malformed cursor", async ({ page }) => {
    const response = await page.goto("/blog?after=not-a-cursor", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });
});
