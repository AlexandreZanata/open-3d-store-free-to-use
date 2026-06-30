/**
 * Contract: docs/api/contract.md POST /orders/capture → whatsappLink
 * Feature: docs/features/whatsapp-flow.md — redirect to wa.me
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe.configure({ mode: "serial" });

test.describe("order via WhatsApp", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test("cart capture redirects to WhatsApp", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("main").getByRole("button", { name: /Add to cart|Adicionar ao carrinho/i }).click();
    await expect
      .poll(async () => {
        const raw = await page.evaluate(() => localStorage.getItem("print3d-cart"));
        if (!raw) {
          return 0;
        }
        const items = JSON.parse(raw) as never[];
        return Array.isArray(items) ? items.length : 0;
      }, { timeout: 15_000 })
      .toBeGreaterThan(0);

    await page.goto("/cart");
    await expect(
      page.getByRole("main").getByRole("link", { name: /Custom Photo Frame|Porta-retrato personalizado/i }).first(),
    ).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("textbox", { name: /Your name|Seu nome/i }).fill("Maria");
    await page.getByRole("button", { name: /Order via WhatsApp|Pedir pelo WhatsApp/i }).click();
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toMatch(/wa\.me|api\.whatsapp\.com/);
  });
});
