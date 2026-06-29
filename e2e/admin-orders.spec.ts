/**
 * Contract: docs/api/admin-contract.md — GET /admin/orders
 */
import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("admin orders list", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and admin session");

  test("orders page finishes loading and shows empty or table state", async ({ page }) => {
    await page.goto(`${adminBase}/orders?page=1`);

    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByText("Loading", { exact: true })).toBeHidden({ timeout: 10_000 });

    const emptyState = page.getByText("No orders yet");
    const ordersTable = page.getByRole("table", { name: "Captured orders" });
    await expect(emptyState.or(ordersTable)).toBeVisible();
  });
});
