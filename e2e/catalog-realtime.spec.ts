/**
 * Contract: docs/features/catalog-realtime.md — storefront SSE invalidation
 */
import { test, expect } from "@playwright/test";

const apiBase = process.env.PLAYWRIGHT_API_BASE ?? "http://127.0.0.1:3010/api/v1";
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@test.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "test-password-12";
const hasDatabase = Boolean(process.env.DATABASE_URL);

type AdminTranslations = {
  en: { name: string; shortDescription: string; description: string };
  "pt-BR": { name: string; shortDescription: string; description: string };
};

test.describe("catalog realtime", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL, API, web, and admin");

  test("storefront product title updates after admin PATCH without reload", async ({
    page,
    request,
  }) => {
    const liveNameEn = `SSE Live ${Date.now()}`;
    const liveNamePt = `SSE Ao Vivo ${Date.now()}`;
    let productId: string | undefined;
    let restoreTranslations: AdminTranslations | undefined;

    await page.goto("/product/custom-photo-frame");
    await page.getByRole("button", { name: "EN", exact: true }).click();

    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1_500);

    await request.post(`${apiBase}/admin/auth/login`, {
      data: { email: adminEmail, password: adminPassword },
    });

    try {
      const products = await request.get(`${apiBase}/admin/products?limit=50`);
      expect(products.ok()).toBeTruthy();
      const productsBody = (await products.json()) as {
        data: Array<{ id: string; slug: string }>;
      };
      const product = productsBody.data.find((item) => item.slug === "custom-photo-frame");
      expect(product?.id).toBeDefined();
      productId = product!.id;

      const before = await request.get(`${apiBase}/admin/products/${productId}`);
      expect(before.ok()).toBeTruthy();
      const beforeBody = (await before.json()) as { data: { translations: AdminTranslations } };
      restoreTranslations = beforeBody.data.translations;

      const patch = await request.patch(`${apiBase}/admin/products/${productId}`, {
        data: {
          translations: {
            en: {
              name: liveNameEn,
              shortDescription: "Short EN",
              description: "Realtime SSE E2E description EN",
            },
            "pt-BR": {
              name: liveNamePt,
              shortDescription: "Curta PT",
              description: "Descrição E2E SSE em tempo real PT",
            },
          },
        },
      });
      expect(patch.ok()).toBeTruthy();

      await expect
        .poll(async () => heading.textContent(), { timeout: 20_000 })
        .toBe(liveNameEn);
    } finally {
      if (productId && restoreTranslations) {
        await request.patch(`${apiBase}/admin/products/${productId}`, {
          data: { translations: restoreTranslations },
        });
      }
    }
  });
});
