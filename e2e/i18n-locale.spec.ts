/**
 * Contract: docs/features/i18n.md — EN ↔ PT-BR visible copy changes
 */
import { test, expect } from "@playwright/test";

import { visible } from "./locators";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const apiBase = process.env.VITE_API_BASE_URL ?? "http://localhost:3010/api/v1";

test.describe.configure({ mode: "serial" });

test.describe("locale switch", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test("switching language updates navigation labels", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "PT", exact: true }).click();
    await expect(visible(page.getByRole("link", { name: "Buscar", exact: true }))).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(visible(page.getByRole("link", { name: "Search", exact: true }))).toBeVisible({
      timeout: 10_000,
    });
  });

  test("API returns localized catalog per Accept-Language", async ({ request }) => {
    const en = await request.get(`${apiBase}/products/custom-photo-frame`, {
      headers: { "Accept-Language": "en" },
    });
    expect(en.ok()).toBeTruthy();
    expect((await en.json()).data.name).toBe("Custom Photo Frame");

    const pt = await request.get(`${apiBase}/products/custom-photo-frame`, {
      headers: { "Accept-Language": "pt-BR" },
    });
    expect(pt.ok()).toBeTruthy();
    expect((await pt.json()).data.name).toBe("Porta-retrato personalizado");
  });
});
