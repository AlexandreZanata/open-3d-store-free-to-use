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
    await page.getByRole("button", { name: /Add to cart|Adicionar ao carrinho/i }).click();
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: /Custom Photo Frame|Porta-retrato personalizado/i }),
    ).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: /Order via WhatsApp|Pedir pelo WhatsApp/i }).click();
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toMatch(/wa\.me|api\.whatsapp\.com/);
  });
});
