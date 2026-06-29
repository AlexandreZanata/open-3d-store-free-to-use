/**
 * Contract: docs/features/admin-panel.md — mobile navigation
 */
import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("admin mobile layout", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and admin setup project");

  test("opens drawer and navigates to orders", async ({ page }) => {
    await page.goto(`${adminBase}/`);
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("navigation", { name: "Admin navigation" })).toBeVisible();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page).toHaveURL(`${adminBase}/orders?page=1`);
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });
});
