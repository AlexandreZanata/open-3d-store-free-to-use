/**
 * Contract: docs/api/admin-contract.md — admin product CRUD
 */
import { test, expect } from "@playwright/test";

const adminBase = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const hasDatabase = Boolean(process.env.DATABASE_URL);

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
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByLabel("Table pagination")).toBeVisible();
    await expect(page.getByLabel("Table pagination")).toContainText(/Page \d+ of \d+/);
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
    const productRow = page.getByRole("row", { name: new RegExp(productSlug) });
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productNamePt);
  });

  test("edits product and shows saved toast", async ({ page }) => {
    await page.goto(`${adminBase}/products`);
    await page.getByRole("row", { name: new RegExp(productSlug) }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Price (BRL)").fill("15.00");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");
  });
});
