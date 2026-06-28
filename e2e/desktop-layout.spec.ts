/**
 * Contract: docs/features/responsive-layout.md — desktop layout at lg+ without changing mobile UI
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("desktop layout", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test.use({ viewport: { width: 1280, height: 800 } });

  test("shows header navigation and hides bottom tab bar on desktop", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("nav.fixed.bottom-0")).toHaveCount(0);
  });

  test("search page exposes desktop filter sidebar", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByLabel(/filters|filtros/i)).toBeVisible({ timeout: 15_000 });
  });

  test("product grid uses multi-column layout on desktop", async ({ page }) => {
    await page.goto("/search?q=custom");
    const grid = page.locator(".grid").filter({ has: page.locator("article") }).first();
    await expect(grid).toBeVisible({ timeout: 20_000 });
    await expect(grid).toHaveClass(/lg:grid-cols-3/);
  });
});
