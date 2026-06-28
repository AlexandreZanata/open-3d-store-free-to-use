/**
 * Contract: docs/api/contract.md GET /products/:slug
 * Feature: docs/features/3d-viewer.md — model-viewer when modelFileUrl set
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("product detail", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test("product page shows contract product and 3D viewer", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("model-viewer")).toBeVisible({ timeout: 20_000 });
  });
});
