# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: desktop-layout.spec.ts >> desktop layout >> shows professional desktop header with cart CTA and no bottom tabs
- Location: e2e/desktop-layout.spec.ts:13:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('nav.fixed.bottom-0')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('nav.fixed.bottom-0')
    14 × locator resolved to 1 element
       - unexpected value "1"

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
        - link "Search" [ref=e23] [cursor=pointer]:
          - /url: /search
          - img [ref=e24]
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
      - generic [ref=e40]:
        - link "Search products" [ref=e41] [cursor=pointer]:
          - /url: /search
          - img [ref=e42]
          - generic [ref=e45]: Search products
        - link "Cart" [ref=e46] [cursor=pointer]:
          - /url: /cart
          - img [ref=e47]
          - text: Cart
  - main [ref=e50]:
    - generic [ref=e52]:
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - img [ref=e58]
            - text: Featured
          - heading "Custom 3D prints — browse and order via WhatsApp" [level=2] [ref=e61]
          - paragraph [ref=e62]: Preview models in 3D, customize options, and send your order directly through WhatsApp.
          - generic [ref=e63]:
            - link "Browse catalog" [ref=e64] [cursor=pointer]:
              - /url: /search
              - text: Browse catalog
              - img [ref=e65]
            - link "Shop by category" [ref=e67] [cursor=pointer]:
              - /url: /categories
        - img [ref=e70]
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]:
            - paragraph [ref=e76]: Shop by category
            - heading "Categories" [level=2] [ref=e77]
          - link "View all" [ref=e78] [cursor=pointer]:
            - /url: /categories
        - generic [ref=e79]:
          - link "Miniatures" [ref=e80] [cursor=pointer]:
            - /url: /search?category=miniatures
            - generic [ref=e81]: Miniatures
          - link "Gifts" [ref=e82] [cursor=pointer]:
            - /url: /search?category=gifts
            - generic [ref=e83]: Gifts
          - link "Tools" [ref=e84] [cursor=pointer]:
            - /url: /search?category=tools
            - generic [ref=e85]: Tools
      - generic [ref=e86]:
        - generic [ref=e87]:
          - heading "Featured products" [level=2] [ref=e88]
          - link "All" [ref=e89] [cursor=pointer]:
            - /url: /search
            - text: All
            - img [ref=e90]
        - generic [ref=e92]:
          - article [ref=e93]:
            - generic [ref=e94]:
              - link "Dragon Figurine RESIN" [ref=e95] [cursor=pointer]:
                - /url: /product/dragon-figurine
                - img "Dragon Figurine" [ref=e96]
                - generic [ref=e97]: RESIN
              - button "Add to favorites" [ref=e98]:
                - img [ref=e99]
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - heading "Dragon Figurine" [level=3] [ref=e103]
                  - generic [ref=e104]: R$ 89,00
                - paragraph [ref=e105]: Tabletop dragon miniature
                - link "View" [ref=e107] [cursor=pointer]:
                  - /url: /product/dragon-figurine
          - article [ref=e108]:
            - generic [ref=e109]:
              - link "Test Product PLA" [ref=e110] [cursor=pointer]:
                - /url: /product/test-product
                - img "Test Product" [ref=e111]
                - generic [ref=e112]: PLA
              - button "Add to favorites" [ref=e113]:
                - img [ref=e114]
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - heading "Test Product" [level=3] [ref=e118]
                  - generic [ref=e119]: R$ 45,00
                - paragraph [ref=e120]: Short desc
                - link "View" [ref=e122] [cursor=pointer]:
                  - /url: /product/test-product
          - article [ref=e123]:
            - generic [ref=e124]:
              - link "Phone Stand PLA" [ref=e125] [cursor=pointer]:
                - /url: /product/phone-stand
                - img "Phone Stand" [ref=e126]
                - generic [ref=e127]: PLA
              - button "Add to favorites" [ref=e128]:
                - img [ref=e129]
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - heading "Phone Stand" [level=3] [ref=e133]
                  - generic [ref=e134]: R$ 25,00
                - paragraph [ref=e135]: Desk phone stand
                - link "View" [ref=e137] [cursor=pointer]:
                  - /url: /product/phone-stand
          - article [ref=e138]:
            - generic [ref=e139]:
              - link "Custom Keychain PETG" [ref=e140] [cursor=pointer]:
                - /url: /product/custom-keychain
                - img "Custom Keychain" [ref=e141]
                - generic [ref=e142]: PETG
              - button "Add to favorites" [ref=e143]:
                - img [ref=e144]
              - generic [ref=e146]:
                - generic [ref=e147]:
                  - heading "Custom Keychain" [level=3] [ref=e148]
                  - generic [ref=e149]: R$ 15,00
                - paragraph [ref=e150]: Name keychain
                - link "View" [ref=e152] [cursor=pointer]:
                  - /url: /product/custom-keychain
          - article [ref=e153]:
            - generic [ref=e154]:
              - link "Planter Pot PLA" [ref=e155] [cursor=pointer]:
                - /url: /product/planter-pot
                - img "Planter Pot" [ref=e156]
                - generic [ref=e157]: PLA
              - button "Add to favorites" [ref=e158]:
                - img [ref=e159]
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - heading "Planter Pot" [level=3] [ref=e163]
                  - generic [ref=e164]: R$ 32,00
                - paragraph [ref=e165]: Small succulent planter
                - link "View" [ref=e167] [cursor=pointer]:
                  - /url: /product/planter-pot
          - article [ref=e168]:
            - generic [ref=e169]:
              - link "Custom Photo Frame 3D PETG" [ref=e170] [cursor=pointer]:
                - /url: /product/custom-photo-frame
                - img "Custom Photo Frame" [ref=e171]
                - generic [ref=e172]: 3D
                - generic [ref=e173]: PETG
              - button "Add to favorites" [ref=e174]:
                - img [ref=e175]
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - heading "Custom Photo Frame" [level=3] [ref=e179]
                  - generic [ref=e180]: R$ 45,00
                - paragraph [ref=e181]: Photo frame with embossed name
                - link "View" [ref=e183] [cursor=pointer]:
                  - /url: /product/custom-photo-frame
      - generic [ref=e184]:
        - generic [ref=e185]:
          - heading "All products" [level=2] [ref=e186]
          - link "All" [ref=e187] [cursor=pointer]:
            - /url: /search
            - text: All
            - img [ref=e188]
        - generic [ref=e190]:
          - article [ref=e191]:
            - generic [ref=e192]:
              - link "Dragon Figurine RESIN" [ref=e193] [cursor=pointer]:
                - /url: /product/dragon-figurine
                - img "Dragon Figurine" [ref=e194]
                - generic [ref=e195]: RESIN
              - button "Add to favorites" [ref=e196]:
                - img [ref=e197]
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - heading "Dragon Figurine" [level=3] [ref=e201]
                  - generic [ref=e202]: R$ 89,00
                - paragraph [ref=e203]: Tabletop dragon miniature
                - link "View" [ref=e205] [cursor=pointer]:
                  - /url: /product/dragon-figurine
          - article [ref=e206]:
            - generic [ref=e207]:
              - link "Test Product PLA" [ref=e208] [cursor=pointer]:
                - /url: /product/test-product
                - img "Test Product" [ref=e209]
                - generic [ref=e210]: PLA
              - button "Add to favorites" [ref=e211]:
                - img [ref=e212]
              - generic [ref=e214]:
                - generic [ref=e215]:
                  - heading "Test Product" [level=3] [ref=e216]
                  - generic [ref=e217]: R$ 45,00
                - paragraph [ref=e218]: Short desc
                - link "View" [ref=e220] [cursor=pointer]:
                  - /url: /product/test-product
          - article [ref=e221]:
            - generic [ref=e222]:
              - link "Phone Stand PLA" [ref=e223] [cursor=pointer]:
                - /url: /product/phone-stand
                - img "Phone Stand" [ref=e224]
                - generic [ref=e225]: PLA
              - button "Add to favorites" [ref=e226]:
                - img [ref=e227]
              - generic [ref=e229]:
                - generic [ref=e230]:
                  - heading "Phone Stand" [level=3] [ref=e231]
                  - generic [ref=e232]: R$ 25,00
                - paragraph [ref=e233]: Desk phone stand
                - link "View" [ref=e235] [cursor=pointer]:
                  - /url: /product/phone-stand
          - article [ref=e236]:
            - generic [ref=e237]:
              - link "Custom Keychain PETG" [ref=e238] [cursor=pointer]:
                - /url: /product/custom-keychain
                - img "Custom Keychain" [ref=e239]
                - generic [ref=e240]: PETG
              - button "Add to favorites" [ref=e241]:
                - img [ref=e242]
              - generic [ref=e244]:
                - generic [ref=e245]:
                  - heading "Custom Keychain" [level=3] [ref=e246]
                  - generic [ref=e247]: R$ 15,00
                - paragraph [ref=e248]: Name keychain
                - link "View" [ref=e250] [cursor=pointer]:
                  - /url: /product/custom-keychain
          - article [ref=e251]:
            - generic [ref=e252]:
              - link "Planter Pot PLA" [ref=e253] [cursor=pointer]:
                - /url: /product/planter-pot
                - img "Planter Pot" [ref=e254]
                - generic [ref=e255]: PLA
              - button "Add to favorites" [ref=e256]:
                - img [ref=e257]
              - generic [ref=e259]:
                - generic [ref=e260]:
                  - heading "Planter Pot" [level=3] [ref=e261]
                  - generic [ref=e262]: R$ 32,00
                - paragraph [ref=e263]: Small succulent planter
                - link "View" [ref=e265] [cursor=pointer]:
                  - /url: /product/planter-pot
          - article [ref=e266]:
            - generic [ref=e267]:
              - link "Custom Photo Frame 3D PETG" [ref=e268] [cursor=pointer]:
                - /url: /product/custom-photo-frame
                - img "Custom Photo Frame" [ref=e269]
                - generic [ref=e270]: 3D
                - generic [ref=e271]: PETG
              - button "Add to favorites" [ref=e272]:
                - img [ref=e273]
              - generic [ref=e275]:
                - generic [ref=e276]:
                  - heading "Custom Photo Frame" [level=3] [ref=e277]
                  - generic [ref=e278]: R$ 45,00
                - paragraph [ref=e279]: Photo frame with embossed name
                - link "View" [ref=e281] [cursor=pointer]:
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
> 20 |     await expect(page.locator("nav.fixed.bottom-0")).toHaveCount(0);
     |                                                      ^ Error: expect(locator).toHaveCount(expected) failed
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