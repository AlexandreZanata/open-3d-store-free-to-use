/**
 * Contract: docs/features/catalog-realtime.md — thumbnail warm cache on return navigation
 * Contract: docs/features/responsive-layout.md — mobile home return navigation
 */
import { test, expect } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

/** Contract: catalog-realtime.md — no multi-second blank tiles on return (UX target 300 ms). */
const RETURN_THUMB_DECODE_MS = 3_000;

async function expectThumbnailDecoded(
  page: import("@playwright/test").Page,
  timeoutMs = 15_000,
): Promise<void> {
  const thumb = page.getByTestId("catalog-thumbnail").first();
  await expect(thumb).toBeVisible({ timeout: timeoutMs });
  await expect
    .poll(
      async () =>
        thumb.evaluate((img) => (img as HTMLImageElement).naturalWidth > 0),
      { timeout: timeoutMs },
    )
    .toBe(true);
}

test.describe("catalog navigation thumbnails", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL, API, web, and seeded catalog");

  test.use({ viewport: { width: 390, height: 844 } });

  test("home thumbnails stay visible after product detail and bottom-nav return", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-tab-bar")).toBeVisible({ timeout: 20_000 });
    await expectThumbnailDecoded(page, 20_000);

    const productLink = page
      .locator("article")
      .first()
      .getByRole("link", { name: /view|ver/i })
      .first();
    await productLink.click();

    await expect(page).toHaveURL(/\/product\//, { timeout: 15_000 });
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId("mobile-tab-bar").getByRole("link", { name: /^home$|^início$/i }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await expectThumbnailDecoded(page, RETURN_THUMB_DECODE_MS);

    const thumbs = page.getByTestId("catalog-thumbnail");
    expect(await thumbs.count()).toBeGreaterThan(0);

    await expect
      .poll(
        async () =>
          thumbs.evaluateAll((images) =>
            images.filter((img) => (img as HTMLImageElement).naturalWidth === 0).length,
          ),
        { timeout: RETURN_THUMB_DECODE_MS },
      )
      .toBe(0);
  });
});
