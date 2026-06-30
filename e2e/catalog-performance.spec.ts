/**
 * Contract: docs/features/catalog-performance.md — mobile catalog prefetch
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

async function expectCatalogTilesVisible(
  page: import("@playwright/test").Page,
  timeoutMs: number,
): Promise<void> {
  const thumbs = page.getByTestId("catalog-thumbnail");
  await expect(thumbs.first()).toBeVisible({ timeout: timeoutMs });
  await expect
    .poll(
      async () =>
        thumbs.first().evaluate((img) => (img as HTMLImageElement).naturalWidth > 0),
      { timeout: timeoutMs },
    )
    .toBe(true);
}

test.describe("mobile catalog performance", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL, API, web, and seeded catalog");

  test.use({ viewport: { width: 390, height: 844 } });

  test("cold home load shows catalog within 5s", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 20_000 });
    await expectCatalogTilesVisible(page, 5_000);
  });

  test("search tab round-trip shows catalog without multi-second blank", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 20_000 });
    await expectCatalogTilesVisible(page, 20_000);

    await page.getByTestId("mobile-tab-bar").getByRole("link", { name: /^search$|^buscar$/i }).click();
    await expect(page).toHaveURL(/\/search/, { timeout: 10_000 });
    await expectCatalogTilesVisible(page, 5_000);

    await page.getByTestId("mobile-tab-bar").getByRole("link", { name: /^home$|^início$/i }).click();
    await expect(page).toHaveURL("/", { timeout: 10_000 });
    await expectCatalogTilesVisible(page, 5_000);

    const startedAt = Date.now();
    await page.getByTestId("mobile-tab-bar").getByRole("link", { name: /^search$|^buscar$/i }).click();
    await expect(page).toHaveURL(/\/search/, { timeout: 10_000 });
    await expectCatalogTilesVisible(page, 1_000);

    const elapsedMs = Date.now() - startedAt;
    expect(elapsedMs).toBeLessThan(3_000);
  });
});
