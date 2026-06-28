# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: desktop-layout.spec.ts >> desktop layout >> search grid uses catalog layout on desktop
- Location: e2e/desktop-layout.spec.ts:39:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('.grid').filter({ has: locator('article') }).first()
Expected: visible
Received: hidden
Timeout:  20000ms

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('.grid').filter({ has: locator('article') }).first()
    43 × locator resolved to <div class="px-4 lg:px-8 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">…</div>
       - unexpected value "hidden"

```

```yaml
- banner:
  - paragraph: 3D print catalog · Order via WhatsApp
  - text: Language
  - button "EN" [pressed]
  - button "PT"
  - link "Home":
    - /url: /
    - text: AXIS
  - navigation "Main navigation":
    - link "Home":
      - /url: /
    - link "Search":
      - /url: /search
    - link "Categories":
      - /url: /categories
    - link "Favorites":
      - /url: /favorites
    - link "Profile":
      - /url: /profile
  - link "Cart":
    - /url: /cart
- main:
  - paragraph: 3D print catalog
  - heading "Search" [level=1]
  - paragraph: Browse the catalog by keyword, category, or material.
  - complementary "Filters":
    - paragraph: Refine results
    - text: Category
    - button "All"
    - button "Miniatures"
    - button "Gifts"
    - button "Tools"
    - text: Material
    - button "All"
    - button "PLA"
    - button "PETG"
    - button "ABS"
    - button "TPU"
    - button "Resin"
  - text: Keyword
  - textbox "Product name or keyword…"
  - paragraph: 6 products
  - article:
    - link "Dragon Figurine Add to favorites":
      - /url: /product/dragon-figurine
      - img "Dragon Figurine"
      - button "Add to favorites"
    - text: RESIN
    - heading "Dragon Figurine" [level=3]
    - paragraph: Tabletop dragon miniature
    - text: R$ 89,00
    - link "View":
      - /url: /product/dragon-figurine
  - article:
    - link "Test Product Add to favorites":
      - /url: /product/test-product
      - img "Test Product"
      - button "Add to favorites"
    - text: PLA
    - heading "Test Product" [level=3]
    - paragraph: Short desc
    - text: R$ 45,00
    - link "View":
      - /url: /product/test-product
  - article:
    - link "Phone Stand Add to favorites":
      - /url: /product/phone-stand
      - img "Phone Stand"
      - button "Add to favorites"
    - text: PLA
    - heading "Phone Stand" [level=3]
    - paragraph: Desk phone stand
    - text: R$ 25,00
    - link "View":
      - /url: /product/phone-stand
  - article:
    - link "Custom Keychain Add to favorites":
      - /url: /product/custom-keychain
      - img "Custom Keychain"
      - button "Add to favorites"
    - text: PETG
    - heading "Custom Keychain" [level=3]
    - paragraph: Name keychain
    - text: R$ 15,00
    - link "View":
      - /url: /product/custom-keychain
  - article:
    - link "Planter Pot Add to favorites":
      - /url: /product/planter-pot
      - img "Planter Pot"
      - button "Add to favorites"
    - text: PLA
    - heading "Planter Pot" [level=3]
    - paragraph: Small succulent planter
    - text: R$ 32,00
    - link "View":
      - /url: /product/planter-pot
  - article:
    - link "Custom Photo Frame 3D Add to favorites":
      - /url: /product/custom-photo-frame
      - img "Custom Photo Frame"
      - text: 3D
      - button "Add to favorites"
    - text: PETG
    - heading "Custom Photo Frame" [level=3]
    - paragraph: Photo frame with embossed name
    - text: R$ 45,00
    - link "View":
      - /url: /product/custom-photo-frame
```

# Test source

```ts
  1  | /**
  2  |  * Contract: docs/features/responsive-layout.md — desktop layout at lg+ without changing mobile UI
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | const hasDatabase = Boolean(process.env.DATABASE_URL);
  7  | 
  8  | test.describe("desktop layout", () => {
  9  |   test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");
  10 | 
  11 |   test.use({ viewport: { width: 1280, height: 800 } });
  12 | 
  13 |   test("shows professional desktop header with cart CTA and no bottom tabs", async ({ page }) => {
  14 |     await page.goto("/");
  15 | 
  16 |     await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toBeVisible({
  17 |       timeout: 20_000,
  18 |     });
  19 |     await expect(page.getByRole("link", { name: /cart|carrinho/i })).toBeVisible();
  20 |     await expect(page.locator("nav.fixed.bottom-0")).toHaveCount(0);
  21 |   });
  22 | 
  23 |   test("home desktop hero uses separate layout from mobile", async ({ page }) => {
  24 |     await page.goto("/");
  25 | 
  26 |     await expect(page.getByText(/shop by category|comprar por categoria/i).first()).toBeVisible({
  27 |       timeout: 20_000,
  28 |     });
  29 |     await expect(page.getByText(/preview models in 3d|visualize modelos em 3d/i)).toBeVisible();
  30 |   });
  31 | 
  32 |   test("search page exposes desktop filter sidebar", async ({ page }) => {
  33 |     await page.goto("/search");
  34 | 
  35 |     await expect(page.getByLabel(/filters|filtros/i)).toBeVisible({ timeout: 15_000 });
  36 |     await expect(page.getByRole("heading", { name: /search|buscar/i, level: 1 })).toBeVisible();
  37 |   });
  38 | 
  39 |   test("search grid uses catalog layout on desktop", async ({ page }) => {
  40 |     await page.goto("/search");
  41 |     const grid = page.locator(".grid").filter({ has: page.locator("article") }).first();
> 42 |     await expect(grid).toBeVisible({ timeout: 20_000 });
     |                        ^ Error: expect(locator).toBeVisible() failed
  43 |     await expect(grid).toHaveClass(/xl:grid-cols-3/);
  44 |   });
  45 | });
  46 | 
  47 | test.describe("mobile layout preserved", () => {
  48 |   test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");
  49 | 
  50 |   test.use({ viewport: { width: 390, height: 844 } });
  51 | 
  52 |   test("keeps bottom tab bar and compact mobile header", async ({ page }) => {
  53 |     await page.goto("/");
  54 | 
  55 |     await expect(page.locator("nav.fixed.bottom-0")).toBeVisible({ timeout: 20_000 });
  56 |     await expect(page.getByRole("link", { name: /home|início/i })).toBeVisible();
  57 |     await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toHaveCount(0);
  58 |   });
  59 | });
  60 | 
```