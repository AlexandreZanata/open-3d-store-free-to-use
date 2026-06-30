/**
 * Contract: docs/api/contract.md — seeded slug `custom-photo-frame`
 * Journey: docs/architecture/system-overview.md — browse catalog
 */
import { test, expect } from "@playwright/test";

import { visible } from "./locators";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("catalog browse", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test("home lists products from API", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes("Hydration")) {
        hydrationErrors.push(message.text());
      }
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Custom Photo Frame|Porta-retrato personalizado/i }).first(),
    ).toBeVisible({
      timeout: 20_000,
    });
    expect(hydrationErrors).toEqual([]);
  });

  test("categories page shows seeded category", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.getByText(/Miniatures|Miniaturas/i)).toBeVisible({ timeout: 20_000 });
  });

  test("search finds product by contract example name", async ({ page }) => {
    await page.goto("/search?q=custom");
    await expect(
      visible(page.getByText(/Custom Photo Frame|Porta-retrato personalizado/i)),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});
