import { expect, test } from "@playwright/test";

test.describe("blog pagination", () => {
  test("navigates forward and backward across cursor pages", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });

    const firstHeading = page.getByRole("heading", { level: 2 }).first();
    await expect(firstHeading).toBeVisible();
    const firstTitle = (await firstHeading.textContent())?.trim();
    expect(firstTitle?.length ?? 0).toBeGreaterThan(0);

    await expect(page.getByRole("link", { name: "Newer posts" })).toHaveCount(0);
    await expect(page.locator("nav[aria-label='Pagination']").getByText("Newer posts")).toHaveAttribute(
      "aria-disabled",
      "true"
    );

    const olderLink = page.getByRole("link", { name: "Older posts" });
    await expect(olderLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\?after=/),
      olderLink.click(),
    ]);

    await page.waitForLoadState("networkidle");
    const secondHeading = page.getByRole("heading", { level: 2 }).first();
    await expect(secondHeading).toBeVisible();
    const secondTitle = (await secondHeading.textContent())?.trim();
    expect(secondTitle?.length ?? 0).toBeGreaterThan(0);
    expect(secondTitle).not.toBe(firstTitle);

    await expect(page.getByRole("link", { name: "Older posts" })).toHaveCount(0);
    await expect(page.locator("nav[aria-label='Pagination']").getByText("Older posts")).toHaveAttribute(
      "aria-disabled",
      "true"
    );

    const newerLink = page.getByRole("link", { name: "Newer posts" });
    await expect(newerLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\?before=/),
      newerLink.click(),
    ]);

    await page.waitForLoadState("networkidle");
    const thirdHeading = page.getByRole("heading", { level: 2 }).first();
    await expect(thirdHeading).toBeVisible();
    const thirdTitle = (await thirdHeading.textContent())?.trim();
    expect(thirdTitle).toBe(firstTitle);

    await expect(page.getByRole("link", { name: "Older posts" })).toBeVisible();
  });

  test("returns 404 for malformed cursor", async ({ page }) => {
    const response = await page.goto("/blog?after=not-a-cursor", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });
});
