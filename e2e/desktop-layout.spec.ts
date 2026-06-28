/**
 * Contract: docs/features/responsive-layout.md — desktop layout at lg+ without changing mobile UI
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("desktop layout", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test.use({ viewport: { width: 1280, height: 800 } });

  test("shows professional desktop header with cart CTA and no bottom tabs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("link", { name: /cart|carrinho/i })).toBeVisible();
    await expect(page.locator("nav.fixed.bottom-0")).toHaveCount(0);
  });

  test("home desktop hero uses separate layout from mobile", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/shop by category|comprar por categoria/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/preview models in 3d|visualize modelos em 3d/i)).toBeVisible();
  });

  test("search page exposes desktop filter sidebar", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByLabel(/filters|filtros/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /search|buscar/i, level: 1 })).toBeVisible();
  });

  test("search grid uses catalog layout on desktop", async ({ page }) => {
    await page.goto("/search");
    const grid = page.locator(".grid").filter({ has: page.locator("article") }).first();
    await expect(grid).toBeVisible({ timeout: 20_000 });
    await expect(grid).toHaveClass(/xl:grid-cols-3/);
  });
});

test.describe("mobile layout preserved", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps bottom tab bar and compact mobile header", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("nav.fixed.bottom-0")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /home|início/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toHaveCount(0);
  });
});
