/**
 * Contract: docs/features/responsive-layout.md — mobile UX (hero, favorites, sticky actions)
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("mobile storefront UX", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test.use({ viewport: { width: 390, height: 844 } });

  test("guest home does not call /me or /favorites", async ({ page }) => {
    const meCalls: string[] = [];
    const favoriteCalls: string[] = [];
    await page.route("**/api/v1/me", (route) => {
      meCalls.push(route.request().url());
      void route.continue();
    });
    await page.route("**/api/v1/favorites", (route) => {
      favoriteCalls.push(route.request().url());
      void route.continue();
    });

    await page.goto("/");
    await expect(page.locator("nav.fixed.bottom-0")).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1_500);

    expect(meCalls).toHaveLength(0);
    expect(favoriteCalls).toHaveLength(0);
  });

  test("mobile hero tile shows rotating corvo 3d logo", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("img", { name: /corvo 3d logo|logo 3d corvo/i }),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("guest can favorite a product from the card heart", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav.fixed.bottom-0")).toBeVisible({ timeout: 20_000 });

    const heart = page.getByRole("button", { name: /favorite|favorito/i }).first();
    await expect(heart).toBeVisible();
    await heart.click();

    await expect(heart).toHaveAttribute("aria-pressed", "true");
  });

  test("favorites page shows empty state without a long skeleton flash", async ({ page }) => {
    await page.goto("/favorites");

    await expect(page.getByText(/no favorites yet|nenhum favorito ainda/i)).toBeVisible({
      timeout: 3_000,
    });
    await expect(page.locator(".animate-pulse")).toHaveCount(0);
  });

  test("product sticky actions hide when footer is in view", async ({ page }) => {
    await page.goto("/product/dragon-figurine");
    await expect(
      page.getByRole("main").getByRole("heading", { name: /Dragon Figurine|Miniatura de dragão/i }),
    ).toBeVisible({ timeout: 15_000 });

    const stickyBar = page.getByTestId("product-sticky-actions");
    await expect(stickyBar.getByRole("button", { name: /add to cart|adicionar ao carrinho/i })).toBeVisible();

    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: /github profile|perfil no github/i })).toBeVisible();

    await expect(stickyBar).toHaveCSS("opacity", "0");
  });
});
