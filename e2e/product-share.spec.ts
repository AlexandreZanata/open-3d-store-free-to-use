/**
 * Contract: docs/features/product-share.md — copy link fallback on desktop
 */
import { test, expect } from "@playwright/test";

import { openShareMenu } from "./locators";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("product share", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
      Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true });
    });
  });

  test("opens share menu and copies product link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/product/custom-photo-frame");

    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    const menu = await openShareMenu(page);
    await menu.getByRole("button", { name: /copy link|copiar link/i }).click();
    await expect(page.getByText(/link copied|link copiado/i)).toBeVisible();

    const clipboard = await page.evaluate(async () => navigator.clipboard.readText());
    expect(clipboard).toMatch(/\/product\/custom-photo-frame/);
    expect(clipboard).toMatch(/Custom Photo Frame|Porta-retrato personalizado/);
  });

  test("WhatsApp share link includes product URL", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    const menu = await openShareMenu(page);
    const whatsapp = menu.getByRole("link", { name: "WhatsApp", exact: true });
    await expect(whatsapp).toHaveAttribute("href", /wa\.me\/\?text=/);
    await expect(whatsapp).toHaveAttribute("href", /custom-photo-frame/);
  });
});
