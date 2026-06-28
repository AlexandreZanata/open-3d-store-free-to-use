# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: desktop-layout.spec.ts >> mobile layout preserved >> keeps bottom tab bar and compact mobile header
- Location: e2e/desktop-layout.spec.ts:52:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /home|início/i })
Expected: visible
Error: strict mode violation: getByRole('link', { name: /home|início/i }) resolved to 2 elements:
    1) <a href="/" aria-label="Home" aria-current="page" data-status="active" class="flex items-center gap-2 shrink-0 active">…</a> aka getByRole('banner').getByRole('link', { name: 'Home' })
    2) <a href="/" aria-current="page" data-status="active" class="flex flex-col items-center justify-center gap-1 press text-foreground active">…</a> aka getByRole('navigation').getByRole('link', { name: 'Home' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /home|início/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Home" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: AXIS
      - link "Search products" [ref=e9] [cursor=pointer]:
        - /url: /search
        - img [ref=e10]
        - generic [ref=e13]: Search products
      - generic [ref=e14]:
        - generic [ref=e15]: Language
        - button "EN" [pressed] [ref=e16]
        - button "PT" [ref=e17]
      - link "Cart" [ref=e18] [cursor=pointer]:
        - /url: /cart
        - img [ref=e19]
  - main [ref=e22]:
    - generic [ref=e23]:
      - link "Featured Custom 3D prints — browse and order via WhatsApp Browse catalog" [ref=e25] [cursor=pointer]:
        - /url: /search
        - generic [ref=e26]:
          - generic [ref=e27]: Featured
          - heading "Custom 3D prints — browse and order via WhatsApp" [level=2] [ref=e28]
          - generic [ref=e29]:
            - text: Browse catalog
            - img [ref=e30]
      - generic [ref=e32]:
        - generic [ref=e33]:
          - heading "Categories" [level=2] [ref=e34]
          - link "View all" [ref=e35] [cursor=pointer]:
            - /url: /categories
        - generic [ref=e36]:
          - link "Miniatures" [ref=e37] [cursor=pointer]:
            - /url: /search?category=miniatures
            - generic [ref=e38]: Miniatures
          - link "Gifts" [ref=e39] [cursor=pointer]:
            - /url: /search?category=gifts
            - generic [ref=e40]: Gifts
          - link "Tools" [ref=e41] [cursor=pointer]:
            - /url: /search?category=tools
            - generic [ref=e42]: Tools
      - generic [ref=e43]:
        - generic [ref=e44]:
          - heading "Featured products" [level=2] [ref=e45]
          - link "All" [ref=e46] [cursor=pointer]:
            - /url: /search
            - text: All
            - img [ref=e47]
        - generic [ref=e50]:
          - article [ref=e52]:
            - generic [ref=e53]:
              - link "Dragon Figurine RESIN" [ref=e54] [cursor=pointer]:
                - /url: /product/dragon-figurine
                - img "Dragon Figurine" [ref=e55]
                - generic [ref=e56]: RESIN
              - button "Add to favorites" [ref=e57]:
                - img [ref=e58]
              - generic [ref=e60]:
                - generic [ref=e61]:
                  - heading "Dragon Figurine" [level=3] [ref=e62]
                  - generic [ref=e63]: R$ 89,00
                - paragraph [ref=e64]: Tabletop dragon miniature
                - link "View" [ref=e66] [cursor=pointer]:
                  - /url: /product/dragon-figurine
          - article [ref=e68]:
            - generic [ref=e69]:
              - link "Test Product PLA" [ref=e70] [cursor=pointer]:
                - /url: /product/test-product
                - img "Test Product" [ref=e71]
                - generic [ref=e72]: PLA
              - button "Add to favorites" [ref=e73]:
                - img [ref=e74]
              - generic [ref=e76]:
                - generic [ref=e77]:
                  - heading "Test Product" [level=3] [ref=e78]
                  - generic [ref=e79]: R$ 45,00
                - paragraph [ref=e80]: Short desc
                - link "View" [ref=e82] [cursor=pointer]:
                  - /url: /product/test-product
          - article [ref=e84]:
            - generic [ref=e85]:
              - link "Phone Stand PLA" [ref=e86] [cursor=pointer]:
                - /url: /product/phone-stand
                - img "Phone Stand" [ref=e87]
                - generic [ref=e88]: PLA
              - button "Add to favorites" [ref=e89]:
                - img [ref=e90]
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - heading "Phone Stand" [level=3] [ref=e94]
                  - generic [ref=e95]: R$ 25,00
                - paragraph [ref=e96]: Desk phone stand
                - link "View" [ref=e98] [cursor=pointer]:
                  - /url: /product/phone-stand
          - article [ref=e100]:
            - generic [ref=e101]:
              - link "Custom Keychain PETG" [ref=e102] [cursor=pointer]:
                - /url: /product/custom-keychain
                - img "Custom Keychain" [ref=e103]
                - generic [ref=e104]: PETG
              - button "Add to favorites" [ref=e105]:
                - img [ref=e106]
              - generic [ref=e108]:
                - generic [ref=e109]:
                  - heading "Custom Keychain" [level=3] [ref=e110]
                  - generic [ref=e111]: R$ 15,00
                - paragraph [ref=e112]: Name keychain
                - link "View" [ref=e114] [cursor=pointer]:
                  - /url: /product/custom-keychain
          - article [ref=e116]:
            - generic [ref=e117]:
              - link "Planter Pot PLA" [ref=e118] [cursor=pointer]:
                - /url: /product/planter-pot
                - img "Planter Pot" [ref=e119]
                - generic [ref=e120]: PLA
              - button "Add to favorites" [ref=e121]:
                - img [ref=e122]
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - heading "Planter Pot" [level=3] [ref=e126]
                  - generic [ref=e127]: R$ 32,00
                - paragraph [ref=e128]: Small succulent planter
                - link "View" [ref=e130] [cursor=pointer]:
                  - /url: /product/planter-pot
          - article [ref=e132]:
            - generic [ref=e133]:
              - link "Custom Photo Frame 3D PETG" [ref=e134] [cursor=pointer]:
                - /url: /product/custom-photo-frame
                - img "Custom Photo Frame" [ref=e135]
                - generic [ref=e136]: 3D
                - generic [ref=e137]: PETG
              - button "Add to favorites" [ref=e138]:
                - img [ref=e139]
              - generic [ref=e141]:
                - generic [ref=e142]:
                  - heading "Custom Photo Frame" [level=3] [ref=e143]
                  - generic [ref=e144]: R$ 45,00
                - paragraph [ref=e145]: Photo frame with embossed name
                - link "View" [ref=e147] [cursor=pointer]:
                  - /url: /product/custom-photo-frame
      - generic [ref=e148]:
        - generic [ref=e149]:
          - heading "All products" [level=2] [ref=e150]
          - link "All" [ref=e151] [cursor=pointer]:
            - /url: /search
            - text: All
            - img [ref=e152]
        - generic [ref=e155]:
          - article [ref=e157]:
            - generic [ref=e158]:
              - link "Dragon Figurine RESIN" [ref=e159] [cursor=pointer]:
                - /url: /product/dragon-figurine
                - img "Dragon Figurine" [ref=e160]
                - generic [ref=e161]: RESIN
              - button "Add to favorites" [ref=e162]:
                - img [ref=e163]
              - generic [ref=e165]:
                - generic [ref=e166]:
                  - heading "Dragon Figurine" [level=3] [ref=e167]
                  - generic [ref=e168]: R$ 89,00
                - paragraph [ref=e169]: Tabletop dragon miniature
                - link "View" [ref=e171] [cursor=pointer]:
                  - /url: /product/dragon-figurine
          - article [ref=e173]:
            - generic [ref=e174]:
              - link "Test Product PLA" [ref=e175] [cursor=pointer]:
                - /url: /product/test-product
                - img "Test Product" [ref=e176]
                - generic [ref=e177]: PLA
              - button "Add to favorites" [ref=e178]:
                - img [ref=e179]
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - heading "Test Product" [level=3] [ref=e183]
                  - generic [ref=e184]: R$ 45,00
                - paragraph [ref=e185]: Short desc
                - link "View" [ref=e187] [cursor=pointer]:
                  - /url: /product/test-product
          - article [ref=e189]:
            - generic [ref=e190]:
              - link "Phone Stand PLA" [ref=e191] [cursor=pointer]:
                - /url: /product/phone-stand
                - img "Phone Stand" [ref=e192]
                - generic [ref=e193]: PLA
              - button "Add to favorites" [ref=e194]:
                - img [ref=e195]
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - heading "Phone Stand" [level=3] [ref=e199]
                  - generic [ref=e200]: R$ 25,00
                - paragraph [ref=e201]: Desk phone stand
                - link "View" [ref=e203] [cursor=pointer]:
                  - /url: /product/phone-stand
          - article [ref=e205]:
            - generic [ref=e206]:
              - link "Custom Keychain PETG" [ref=e207] [cursor=pointer]:
                - /url: /product/custom-keychain
                - img "Custom Keychain" [ref=e208]
                - generic [ref=e209]: PETG
              - button "Add to favorites" [ref=e210]:
                - img [ref=e211]
              - generic [ref=e213]:
                - generic [ref=e214]:
                  - heading "Custom Keychain" [level=3] [ref=e215]
                  - generic [ref=e216]: R$ 15,00
                - paragraph [ref=e217]: Name keychain
                - link "View" [ref=e219] [cursor=pointer]:
                  - /url: /product/custom-keychain
          - article [ref=e221]:
            - generic [ref=e222]:
              - link "Planter Pot PLA" [ref=e223] [cursor=pointer]:
                - /url: /product/planter-pot
                - img "Planter Pot" [ref=e224]
                - generic [ref=e225]: PLA
              - button "Add to favorites" [ref=e226]:
                - img [ref=e227]
              - generic [ref=e229]:
                - generic [ref=e230]:
                  - heading "Planter Pot" [level=3] [ref=e231]
                  - generic [ref=e232]: R$ 32,00
                - paragraph [ref=e233]: Small succulent planter
                - link "View" [ref=e235] [cursor=pointer]:
                  - /url: /product/planter-pot
          - article [ref=e237]:
            - generic [ref=e238]:
              - link "Custom Photo Frame 3D PETG" [ref=e239] [cursor=pointer]:
                - /url: /product/custom-photo-frame
                - img "Custom Photo Frame" [ref=e240]
                - generic [ref=e241]: 3D
                - generic [ref=e242]: PETG
              - button "Add to favorites" [ref=e243]:
                - img [ref=e244]
              - generic [ref=e246]:
                - generic [ref=e247]:
                  - heading "Custom Photo Frame" [level=3] [ref=e248]
                  - generic [ref=e249]: R$ 45,00
                - paragraph [ref=e250]: Photo frame with embossed name
                - link "View" [ref=e252] [cursor=pointer]:
                  - /url: /product/custom-photo-frame
  - navigation [ref=e253]:
    - generic [ref=e254]:
      - link "Home" [ref=e255] [cursor=pointer]:
        - /url: /
        - img [ref=e257]
        - generic [ref=e261]: Home
      - link "Search" [ref=e262] [cursor=pointer]:
        - /url: /search
        - img [ref=e264]
        - generic [ref=e267]: Search
      - link "Categories" [ref=e268] [cursor=pointer]:
        - /url: /categories
        - img [ref=e270]
        - generic [ref=e275]: Categories
      - link "Favorites" [ref=e276] [cursor=pointer]:
        - /url: /favorites
        - img [ref=e278]
        - generic [ref=e280]: Favorites
      - link "Profile" [ref=e281] [cursor=pointer]:
        - /url: /profile
        - img [ref=e283]
        - generic [ref=e286]: Profile
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
> 56 |     await expect(page.getByRole("link", { name: /home|início/i })).toBeVisible();
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  57 |     await expect(page.getByRole("navigation", { name: /main navigation|navegação principal/i })).toHaveCount(0);
  58 |   });
  59 | });
  60 | 
```