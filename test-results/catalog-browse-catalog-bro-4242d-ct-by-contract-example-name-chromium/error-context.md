# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog-browse.spec.ts >> catalog browse >> search finds product by contract example name
- Location: e2e/catalog-browse.spec.ts:26:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Custom Photo Frame|Porta-retrato personalizado/i)
Expected: visible
Error: strict mode violation: getByText(/Custom Photo Frame|Porta-retrato personalizado/i) resolved to 2 elements:
    1) <h3 class="text-sm font-semibold tracking-tight truncate">Custom Photo Frame</h3> aka locator('article').filter({ hasText: '3DPETGCustom Photo FrameR$ 45' }).locator('h3')
    2) <h3 class="mt-2 text-base font-semibold tracking-tight leading-snug line-clamp-2 min-h-[2.75rem]">Custom Photo Frame</h3> aka getByRole('heading', { name: 'Custom Photo Frame' })

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText(/Custom Photo Frame|Porta-retrato personalizado/i)

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
              - generic [ref=e59]:
                - button "All" [ref=e60]
                - button "Miniatures" [ref=e61]
                - button "Gifts" [ref=e62]
                - button "Tools" [ref=e63]
            - generic [ref=e64]:
              - generic [ref=e65]: Material
              - generic [ref=e66]:
                - button "All" [ref=e67]
                - button "PLA" [ref=e68]
                - button "PETG" [ref=e69]
                - button "ABS" [ref=e70]
                - button "TPU" [ref=e71]
                - button "Resin" [ref=e72]
        - generic [ref=e73]:
          - generic [ref=e74]:
            - text: Keyword
            - generic [ref=e75]:
              - img [ref=e76]
              - textbox "Product name or keyword…" [active] [ref=e79]: custom
              - button "Clear search" [ref=e80]:
                - img [ref=e81]
          - paragraph [ref=e85]: 2 products
          - generic [ref=e86]:
            - article [ref=e87]:
              - generic [ref=e88]:
                - link "Custom Keychain Add to favorites" [ref=e89] [cursor=pointer]:
                  - /url: /product/custom-keychain
                  - img "Custom Keychain" [ref=e90]
                  - button "Add to favorites" [ref=e91]:
                    - img [ref=e92]
                - generic [ref=e94]:
                  - generic [ref=e95]: PETG
                  - heading "Custom Keychain" [level=3] [ref=e96]
                  - paragraph [ref=e97]: Name keychain
                  - generic [ref=e98]:
                    - generic [ref=e99]: R$ 15,00
                    - link "View" [ref=e100] [cursor=pointer]:
                      - /url: /product/custom-keychain
            - article [ref=e101]:
              - generic [ref=e102]:
                - link "Custom Photo Frame 3D Add to favorites" [ref=e103] [cursor=pointer]:
                  - /url: /product/custom-photo-frame
                  - img "Custom Photo Frame" [ref=e104]
                  - generic [ref=e105]: 3D
                  - button "Add to favorites" [ref=e106]:
                    - img [ref=e107]
                - generic [ref=e109]:
                  - generic [ref=e110]: PETG
                  - heading "Custom Photo Frame" [level=3] [ref=e111]
                  - paragraph [ref=e112]: Photo frame with embossed name
                  - generic [ref=e113]:
                    - generic [ref=e114]: R$ 45,00
                    - link "View" [ref=e115] [cursor=pointer]:
                      - /url: /product/custom-photo-frame
```

# Test source

```ts
  1  | /**
  2  |  * Contract: docs/api/contract.md — seeded slug `custom-photo-frame`
  3  |  * Journey: docs/architecture/system-overview.md — browse catalog
  4  |  */
  5  | import { test, expect } from "@playwright/test";
  6  | 
  7  | const hasDatabase = Boolean(process.env.DATABASE_URL);
  8  | 
  9  | test.describe("catalog browse", () => {
  10 |   test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");
  11 | 
  12 |   test("home lists products from API", async ({ page }) => {
  13 |     await page.goto("/");
  14 |     await expect(
  15 |       page.getByRole("heading", { name: /Custom Photo Frame|Porta-retrato personalizado/i }).first(),
  16 |     ).toBeVisible({
  17 |       timeout: 20_000,
  18 |     });
  19 |   });
  20 | 
  21 |   test("categories page shows seeded category", async ({ page }) => {
  22 |     await page.goto("/categories");
  23 |     await expect(page.getByText(/Miniatures|Miniaturas/i)).toBeVisible({ timeout: 20_000 });
  24 |   });
  25 | 
  26 |   test("search finds product by contract example name", async ({ page }) => {
  27 |     const responsePromise = page.waitForResponse(
  28 |       (resp) => resp.url().includes("/api/v1/products") && resp.status() === 200,
  29 |     );
  30 |     await page.goto("/search?q=custom");
  31 |     await responsePromise;
> 32 |     await expect(page.getByText(/Custom Photo Frame|Porta-retrato personalizado/i)).toBeVisible({
     |                                                                                     ^ Error: expect(locator).toBeVisible() failed
  33 |       timeout: 15_000,
  34 |     });
  35 |   });
  36 | });
  37 | 
```