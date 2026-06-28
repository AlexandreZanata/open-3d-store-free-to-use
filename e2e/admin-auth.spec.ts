/**
 * Contract: docs/api/admin-contract.md — POST /admin/auth/login
 */
import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@test.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "test-password-12";
const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("admin authentication", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded admin user");

  test("shows generic error on invalid credentials", async ({ page }) => {
    await page.goto(`${adminBase}/login`);
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrong-password-12");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(`${adminBase}/login`);
  });

  test("redirects to dashboard after successful login", async ({ page }) => {
    await page.goto(`${adminBase}/login`);
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(`${adminBase}/`);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    await expect(page).toHaveURL(`${adminBase}/login`);
  });
});
