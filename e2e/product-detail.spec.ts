/**
 * Contract: docs/features/3d-viewer.md — Three.js viewer when modelFileUrl set
 * Contract: docs/features/responsive-layout.md — product detail two-column layout
 */
import { test, expect } from "@playwright/test";

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
      page
        .getByRole("img", { name: /3D preview|Visualização 3D/i })
        .or(page.getByText(/too large to preview|grande demais para visualizar/i)),
    ).toBeVisible({
      timeout: 20_000,
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
    await expect(page.getByRole("img", { name: /3D preview|Visualização 3D/i })).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/real scale|escala real/i)).toBeVisible();
  });

  test("gallery carousel advances on product with multiple images", async ({ page }) => {
    await page.goto("/product/custom-photo-frame");
    await expect(
      page.getByRole("main").getByRole("heading", {
        name: /Custom Photo Frame|Porta-retrato personalizado/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    const galleryTab = page.getByRole("tab", { name: /gallery|galeria/i });
    await galleryTab.click();

    const firstSlide = page.getByRole("img", { name: /image 1|imagem 1/i });
    await expect(firstSlide).toBeVisible();
    await page.getByRole("button", { name: /next image|próxima imagem/i }).click();
    await expect(page.getByRole("img", { name: /image 2|imagem 2/i })).toBeVisible();
  });
});
