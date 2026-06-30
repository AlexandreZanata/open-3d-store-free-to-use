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
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1_500);

    expect(meCalls).toHaveLength(0);
    expect(favoriteCalls).toHaveLength(0);
  });

  test("mobile hero tile shows rotating corvo 3d logo", async ({ page }) => {
    await page.goto("/");
    const placeholder = page.getByTestId("hero-logo-placeholder").first();
    await expect(placeholder).toBeVisible({ timeout: 5_000 });
    await expect(placeholder.locator('img[src="/brand/corvo-logo.png"].brightness-0')).toBeVisible();
    await expect(
      page.getByRole("img", { name: /corvo 3d logo|logo 3d corvo/i }),
    ).toBeVisible({ timeout: 25_000 });
    await expect(page.getByTestId("hero-logo-placeholder")).toHaveCount(0, { timeout: 25_000 });
  });

  test("guest can favorite a product from the card heart", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 20_000 });

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
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(footer.getByRole("link", { name: /github profile|perfil no github/i })).toBeVisible();

    await expect(stickyBar).toHaveCSS("opacity", "0");
  });

  test("mobile tab bar stays flush when viewport bottom inset is applied", async ({ page }) => {
    await page.goto("/product/dragon-figurine");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 15_000 });

    const tabBar = page.getByTestId("mobile-tab-bar");
    const tabRow = tabBar.locator(".mobile-tab-bar-row");
    const tabFill = tabBar.locator(".mobile-tab-bar-fill");
    const insetPx = 48;
    const layoutHeight = 844;

    await page.evaluate((vvHeight) => {
      Object.defineProperty(window, "visualViewport", {
        configurable: true,
        value: {
          height: vvHeight,
          offsetTop: 0,
          addEventListener: (type: string, listener: EventListener) => {
            window.addEventListener(type, listener);
          },
          removeEventListener: (type: string, listener: EventListener) => {
            window.removeEventListener(type, listener);
          },
        },
      });
      window.dispatchEvent(new Event("resize"));
    }, layoutHeight - insetPx);

    await page.waitForTimeout(200);

    await expect(tabBar).toHaveCSS("bottom", "0px");
    await expect(tabRow).toHaveCSS("margin-bottom", `${insetPx}px`);
    await expect(tabFill).toHaveCSS("height", `${insetPx}px`);

    const assertShellFlush = async () => {
      const innerHeight = await page.evaluate(() => window.innerHeight);
      const box = await tabBar.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(Math.abs(box.y + box.height - innerHeight)).toBeLessThanOrEqual(2);
      }
    };

    await assertShellFlush();

    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    await expect(tabBar).toHaveCSS("bottom", "0px");
    await expect(tabRow).toHaveCSS("margin-bottom", `${insetPx}px`);
    await assertShellFlush();
  });

  test("mobile tab bar holds inset during transient viewport readings", async ({ page }) => {
    await page.goto("/product/dragon-figurine");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 15_000 });

    const tabBar = page.getByTestId("mobile-tab-bar");
    const tabRow = tabBar.locator(".mobile-tab-bar-row");
    const insetPx = 48;
    const layoutHeight = 844;

    await page.evaluate((vvHeight) => {
      let height = vvHeight;
      Object.defineProperty(window, "visualViewport", {
        configurable: true,
        value: {
          get height() {
            return height;
          },
          offsetTop: 0,
          addEventListener: (type: string, listener: EventListener) => {
            window.addEventListener(type, listener);
          },
          removeEventListener: (type: string, listener: EventListener) => {
            window.removeEventListener(type, listener);
          },
        },
      });
      (window as Window & { __setVvHeight?: (next: number) => void }).__setVvHeight = (next) => {
        height = next;
        window.dispatchEvent(new Event("resize"));
      };
      window.dispatchEvent(new Event("resize"));
    }, layoutHeight - insetPx);

    await page.waitForTimeout(200);
    await expect(tabRow).toHaveCSS("margin-bottom", `${insetPx}px`);

    await page.evaluate((fullHeight) => {
      (window as Window & { __setVvHeight?: (next: number) => void }).__setVvHeight?.(fullHeight);
    }, layoutHeight);
    await page.waitForTimeout(50);
    await expect(tabRow).toHaveCSS("margin-bottom", `${insetPx}px`);

    await page.waitForTimeout(150);
    await expect(tabRow).toHaveCSS("margin-bottom", "0px");
  });
});
