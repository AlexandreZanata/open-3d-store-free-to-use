/**
 * Contract: docs/api/admin-contract.md — admin product CRUD
 */
import path from "node:path";

import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const hasDatabase = Boolean(process.env.DATABASE_URL);
const fixtureDir = path.join(process.cwd(), "e2e", "fixtures");

const productSlug = `e2e-admin-${Date.now()}`;
const productNamePt = `E2E Product PT ${productSlug}`;
const productNameEn = `E2E Product EN ${productSlug}`;

test.describe.configure({ mode: "serial" });

test.describe("admin product CRUD", () => {
  test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog + admin");

  test("products filter toolbar has labeled fields and applies search", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    await expect(page.getByLabel("Search")).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();

    await page.getByLabel("Search").fill("photo");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/[?&]q=photo/);
  });

  test("products list shows shared DataTable with pagination footer", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    const main = page.getByRole("main");
    await expect(main.getByRole("table")).toBeVisible();
    const pagination = main.getByLabel("Table pagination");
    await expect(pagination).toBeVisible();
    await expect(pagination).toContainText(/Page \d+ of \d+/);
  });

  test("creates product and shows it in the list", async ({ page }) => {
    await page.goto(`${adminBase}/products/new`);
    await page.getByLabel("Slug").fill(productSlug);
    await page.locator("select").first().selectOption({ index: 1 });
    await page.getByLabel("Price (BRL)").fill("12.50");
    await page.getByLabel("Thumbnail URL").fill("/models/thumbnails/photo-frame.webp");
    await page.getByLabel("Name").fill(productNamePt);
    await page.getByLabel("Short description").fill("Curta PT");
    await page.getByLabel("Description", { exact: true }).fill("Descricao completa PT para teste E2E admin");
    await page.getByRole("button", { name: "EN" }).click();
    await page.getByLabel("Name").fill(productNameEn);
    await page.getByLabel("Short description").fill("Short EN");
    await page.getByLabel("Description", { exact: true }).fill("Full EN description for admin E2E");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(new RegExp(`${adminBase}/products/.+`));

    await page.goto(`${adminBase}/products`);
    const main = page.getByRole("main");
    const productRow = main.getByRole("row", { name: new RegExp(productSlug) });
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productNamePt);
  });

  test("edits product and shows saved toast", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    await page.getByRole("main").getByRole("row", { name: new RegExp(productSlug) }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Price (BRL)").fill("15.00");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");
  });

  test("edit product has back button and uploads PNG thumbnail from disk", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    await page.getByRole("main").getByRole("row", { name: new RegExp(productSlug) }).getByRole("link", { name: "Edit" }).click();

    await expect(page.getByRole("link", { name: "Back to products" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Edit product" })).toBeVisible();

    const thumbnailField = page.getByLabel("Thumbnail URL");
    await thumbnailField.locator("xpath=ancestor::div[contains(@class,'space-y-3')][1]").locator('input[type="file"]').setInputFiles(
      path.join(fixtureDir, "test-upload.png"),
    );

    await expect(thumbnailField).toHaveValue(/\/models\/thumbnails\/.+\.webp$/, { timeout: 15_000 });

    const previewImage = page.getByTestId("upload-preview-thumbnail").locator("img");
    await expect(previewImage).toBeVisible({ timeout: 15_000 });
    await expect(previewImage).toHaveAttribute("src", /.+/);
    const naturalWidth = await previewImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");

    await page.reload();
    await expect(page.getByLabel("Thumbnail URL")).toHaveValue(/\/models\/thumbnails\/.+\.webp$/);
    await expect(page.getByTestId("upload-preview-thumbnail").locator("img")).toBeVisible();
  });
});
