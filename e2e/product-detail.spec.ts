/**
 * Contract: docs/features/3d-viewer.md — Three.js viewer when modelFileUrl set
 * Contract: docs/features/responsive-layout.md — product detail two-column layout
 */
import { test, expect } from "@playwright/test";

import { visible } from "./locators";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("product detail", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");

  test("product page shows contract product and 3D viewer canvas", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      visible(page.getByRole("img", { name: /3D preview|Visualização 3D/i })).or(
        visible(page.getByText(/too large to preview|grande demais para visualizar/i)),
      ),
    ).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/real scale|escala real/i)).toBeVisible();
  });

  test("dragon figurine loads Draco preview GLB without unavailable fallback", async ({ page }) => {
    await page.goto("/product/dragon-figurine");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Dragon Figurine|Miniatura de dragão/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/3D preview unavailable|Visualização 3D indisponível/i)).toHaveCount(
      0,
    );
    await expect(visible(page.getByRole("img", { name: /3D preview|Visualização 3D/i }))).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/real scale|escala real/i)).toBeVisible();
  });

  test("mobile product info shows favorite, share, and stacked details", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/product/dragon-figurine");

    await expect(
      page.getByRole("main").getByRole("heading", { name: /Dragon Figurine|Miniatura de dragão/i }),
    ).toBeVisible({ timeout: 15_000 });

    const social = page.getByTestId("product-social-actions");
    await expect(social).toBeVisible();
    await expect(social.getByRole("button", { name: /favorite|favorito/i })).toBeVisible();
    await expect(social.getByRole("button", { name: /share|compartilhar/i })).toBeVisible();
    await expect(page.locator(".lg\\:hidden").getByText(/R\$/)).toBeVisible();
    await expect(page.locator(".lg\\:hidden").getByText(/PETG/i)).toBeVisible();
  });

  test("gallery carousel advances on product with multiple images", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      visible(page.getByRole("img", { name: /3D preview|Visualização 3D/i })),
    ).toBeVisible({ timeout: 25_000 });

    const tablist = page.getByRole("main").getByRole("tablist");
    await tablist.getByRole("tab").nth(1).click();
    await expect(tablist.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true", {
      timeout: 5_000,
    });
    await expect(visible(page.getByRole("img", { name: /— image 1|— imagem 1/i }))).toBeVisible({
      timeout: 10_000,
    });
    await visible(page.getByRole("button", { name: /next image|próxima imagem/i })).click();
    await expect(visible(page.getByRole("img", { name: /— image 2|— imagem 2/i }))).toBeVisible();
  });
});
