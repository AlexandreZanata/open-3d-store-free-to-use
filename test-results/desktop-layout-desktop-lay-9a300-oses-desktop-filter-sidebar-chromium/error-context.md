# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: desktop-layout.spec.ts >> desktop layout >> search page exposes desktop filter sidebar
- Location: e2e/desktop-layout.spec.ts:32:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel(/filters|filtros/i)
Expected: visible
Error: strict mode violation: getByLabel(/filters|filtros/i) resolved to 2 elements:
    1) <button aria-label="Filtros" class="size-10 grid place-items-center rounded-full ring-1 ring-hairline press bg-surface">…</button> aka getByLabel('Filtros').first()
    2) <aside aria-label="Filtros" class="sticky top-14 lg:top-[6.5rem] self-start">…</aside> aka getByRole('complementary', { name: 'Filtros' })

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByLabel(/filters|filtros/i)

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - paragraph [ref=e6]: 3D print catalog · Order via WhatsApp
      - generic [ref=e7]:
        - generic [ref=e8]: Language
        - button "EN" [pressed] [ref=e9]
        - button "PT" [ref=e10]
    - generic [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /
        - generic [ref=e16]: AXIS
      - navigation "Main navigation" [ref=e17]:
        - link "Home" [ref=e18] [cursor=pointer]:
          - /url: /
          - img [ref=e19]
          - text: Home
        - link "Search" [ref=e22] [cursor=pointer]:
          - /url: /search
          - img [ref=e23]
          - text: Search
        - link "Categories" [ref=e27] [cursor=pointer]:
          - /url: /categories
          - img [ref=e28]
          - text: Categories
        - link "Favorites" [ref=e33] [cursor=pointer]:
          - /url: /favorites
          - img [ref=e34]
          - text: Favorites
        - link "Profile" [ref=e36] [cursor=pointer]:
          - /url: /profile
          - img [ref=e37]
          - text: Profile
      - link "Cart" [ref=e41] [cursor=pointer]:
        - /url: /cart
        - img [ref=e42]
        - text: Cart
  - main [ref=e45]:
    - generic [ref=e47]:
      - generic [ref=e48]:
        - paragraph [ref=e49]: 3D print catalog
        - heading "Search" [level=1] [ref=e50]
        - paragraph [ref=e51]: Browse the catalog by keyword, category, or material.
      - generic [ref=e52]:
        - complementary "Filters" [ref=e53]:
          - generic [ref=e54]:
            - paragraph [ref=e56]: Refine results
            - generic [ref=e57]:
              - generic [ref=e58]: Category
              - button "All" [ref=e60]
            - generic [ref=e61]:
              - generic [ref=e62]: Material
              - generic [ref=e63]:
                - button "All" [ref=e64]
                - button "PLA" [ref=e65]
                - button "PETG" [ref=e66]
                - button "ABS" [ref=e67]
                - button "TPU" [ref=e68]
                - button "Resin" [ref=e69]
        - generic [ref=e70]:
          - generic [ref=e71]:
            - text: Keyword
            - generic [ref=e72]:
              - img [ref=e73]
              - textbox "Product name or keyword…" [active] [ref=e76]
          - paragraph [ref=e78]: 0 products
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
> 35 |     await expect(page.getByLabel(/filters|filtros/i)).toBeVisible({ timeout: 15_000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  36 |     await expect(page.getByRole("heading", { name: /search|buscar/i, level: 1 })).toBeVisible();
  37 |   });
  38 | 
  39 |   test("search grid uses catalog layout on desktop", async ({ page }) => {
  40 |     await page.goto("/search");
  41 |     const grid = page.locator(".grid").filter({ has: page.locator("article") }).first();
  42 |     await expect(grid).toBeVisible({ timeout: 20_000 });
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