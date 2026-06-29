/**
 * Contract: docs/api/admin-contract.md — POST /admin/auth/login
 */
import path from "node:path";

import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@test.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "test-password-12";
const hasDatabase = Boolean(process.env.DATABASE_URL);
const fixtureDir = path.join(process.cwd(), "e2e", "fixtures");

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

  test("logout clears session and returns to login", async ({ page }) => {
    await page.goto(`${adminBase}/login`);
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(`${adminBase}/`);

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(`${adminBase}/login`);

    await page.goto(`${adminBase}/products`);
    await expect(page).toHaveURL(`${adminBase}/login`);
  });

  test("redirects to login when upload runs without a session cookie", async ({ page, context }) => {
    await page.goto(`${adminBase}/login`);
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(`${adminBase}/`);

    await page.goto(`${adminBase}/products`);
    await page.getByRole("row").nth(1).getByRole("link", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: "Edit product" })).toBeVisible();

    await context.clearCookies();

    const thumbnailField = page.getByLabel("Thumbnail URL");
    await thumbnailField
      .locator("xpath=ancestor::div[contains(@class,'space-y-3')][1]")
      .locator('input[type="file"]')
      .setInputFiles(path.join(fixtureDir, "test-upload.png"));

    await expect(page).toHaveURL(`${adminBase}/login`, { timeout: 15_000 });
  });
});
