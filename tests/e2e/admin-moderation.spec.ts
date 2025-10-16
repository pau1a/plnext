import { expect, test } from "@playwright/test";

test.describe("admin moderation", () => {
  test.describe.configure({ mode: "serial" });

  test("redirects unauthenticated visitors to the login screen", async ({ page }) => {
    await page.goto("/admin/comments", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: /admin sign-in/i })).toBeVisible();
  });

  test("blocks tokens without moderation permissions", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.getByLabel(/access token/i).fill("viewer-token");
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/admin/login") && response.status() < 500),
      page.getByRole("button", { name: /sign in/i }).click(),
    ]);
    await expect(page.getByText(/do not have permission/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("allows moderators to approve pending comments", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.getByLabel(/access token/i).fill("moderator-token");
    await Promise.all([
      page.waitForURL(/\/admin\/comments/),
      page.getByRole("button", { name: /sign in/i }).click(),
    ]);

    await expect(page.getByRole("heading", { name: /comment moderation/i })).toBeVisible();
    const queueItem = page.getByRole("heading", { level: 3, name: "Alex" });
    await expect(queueItem).toBeVisible();

    const notesField = page.getByLabel(/moderation notes/i);
    await notesField.fill("Approved during e2e test");

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("pl_site.moderation_audit_log") && response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Approve" }).click(),
    ]);

    await expect(page.getByText(/no comments match this filter/i)).toBeVisible();

    await page.getByRole("tab", { name: "Approved" }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Alex" })).toBeVisible();
  });
});
