/**
 * Contract: docs/features/catalog-realtime.md — thumbnail warm cache on return navigation
 * Contract: docs/features/responsive-layout.md — mobile home return navigation
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

async function expectThumbnailDecoded(
  page: import("@playwright/test").Page,
  timeoutMs = 15_000,
): Promise<void> {
  const thumb = page.getByTestId("catalog-thumbnail").first();
  await expect(thumb).toBeVisible({ timeout: timeoutMs });
  await expect
    .poll(
      async () =>
        thumb.evaluate((img) => {
          const el = img as HTMLImageElement;
          const opacity = Number.parseFloat(getComputedStyle(el).opacity);
          return el.naturalWidth > 0 && opacity > 0;
        }),
      { timeout: timeoutMs },
    )
    .toBe(true);
}

test.describe("catalog navigation thumbnails", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL, API, web, and seeded catalog");

  test.use({ viewport: { width: 390, height: 844 } });

  test("home thumbnails stay visible after product detail and bottom-nav return", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav.fixed.bottom-0")).toBeVisible({ timeout: 20_000 });
    await expectThumbnailDecoded(page, 20_000);

    const productLink = page
      .locator("article")
      .first()
      .getByRole("link", { name: /view|ver/i })
      .first();
    await productLink.click();

    await expect(page).toHaveURL(/\/product\//, { timeout: 15_000 });
    await page.waitForTimeout(5_000);

    await page.getByRole("link", { name: /^home$|^início$/i }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await expectThumbnailDecoded(page, 1_000);

    const thumbs = page.getByTestId("catalog-thumbnail");
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(0);

    await expect
      .poll(
        async () => {
          const hidden = await thumbs.evaluateAll((images) =>
            images.filter((img) => {
              const el = img as HTMLImageElement;
              const opacity = Number.parseFloat(getComputedStyle(el).opacity);
              return el.naturalWidth === 0 || opacity === 0;
            }).length,
          );
          return hidden;
        },
        { timeout: 1_000 },
      )
      .toBe(0);
  });
});
