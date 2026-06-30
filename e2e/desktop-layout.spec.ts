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
    await expect(
      page.getByRole("img", { name: /corvo 3d logo|logo 3d corvo/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/custom 3d prints —|impressões 3d personalizadas —/i)).toHaveCount(0);
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

  test("search catalog cards use square image tiles", async ({ page }) => {
    await page.goto("/search");
    const tile = page.locator("article a.aspect-square").first();
    await expect(tile).toBeVisible({ timeout: 20_000 });
    const box = await tile.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    }
  });

  test("shows site footer with contact links", async ({ page }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible({ timeout: 20_000 });
    await expect(footer.getByText(/like this site|gostou deste site/i)).toBeVisible();
    await expect(footer.getByRole("link", { name: /github profile|perfil no github/i })).toHaveAttribute(
      "href",
      "https://github.com/AlexandreZanata",
    );
    await expect(footer.getByText("alexandrezanatavasconcelos@gmail.com")).toBeVisible();
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

  test("active tab uses filled icon without accent dot", async ({ page }) => {
    await page.goto("/");

    const bottomNav = page.locator("nav.fixed.bottom-0");
    const homeTab = bottomNav.getByRole("link", { name: /home|início/i });
    await expect(homeTab).toBeVisible({ timeout: 20_000 });
    await expect(homeTab.locator(".bg-accent")).toHaveCount(0);
    await expect(homeTab.locator("svg").first()).toHaveAttribute("fill", "currentColor");

    await bottomNav.getByRole("link", { name: /search|buscar/i }).click();
    await expect(page).toHaveURL(/\/search/);
    const searchTab = bottomNav.getByRole("link", { name: /search|buscar/i });
    await expect(searchTab.locator("svg").first()).toHaveAttribute("fill", "currentColor");
    await expect(homeTab.locator("svg").first()).toHaveAttribute("fill", "none");
  });

  test("mobile hero card shows 3D Corvo logo beside featured copy", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/3d prints on whatsapp|impressões 3d no whatsapp/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/browse models and order in seconds|veja modelos e peça em segundos/i)).toBeVisible();
    await expect(
      page.getByRole("img", { name: /corvo 3d logo|logo 3d corvo/i }),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("home product cards use square image tiles", async ({ page }) => {
    await page.goto("/");
    const tile = page.locator("article a.aspect-square").first();
    await expect(tile).toBeVisible({ timeout: 20_000 });
    const box = await tile.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    }
  });

  test("shows site footer above bottom tab bar", async ({ page }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible({ timeout: 20_000 });
    await expect(footer.getByText(/gostou deste site|like this site/i)).toBeVisible();
    await expect(footer.getByText("alexandrezanatavasconcelos@gmail.com")).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /e-mail alexandrezanata|email alexandrezanata/i })).toHaveAttribute(
      "href",
      "mailto:alexandrezanatavasconcelos@gmail.com",
    );
  });
});
