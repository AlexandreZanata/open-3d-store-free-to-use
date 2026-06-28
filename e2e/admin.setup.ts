/**
 * Saves admin session for product CRUD E2E (avoids repeated login / rate limit).
 */
import path from "node:path";
import { test as setup, expect } from "@playwright/test";

const adminAuthFile = path.join("e2e", ".auth", "admin-session.json");
const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@test.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "test-password-12";
const hasDatabase = Boolean(process.env.DATABASE_URL);

setup("authenticate admin", async ({ page }) => {
  setup.skip(!hasDatabase, "Requires DATABASE_URL and seeded admin user");

  await page.goto(`${adminBase}/login`);
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(`${adminBase}/`);
  await page.context().storageState({ path: adminAuthFile });
});
