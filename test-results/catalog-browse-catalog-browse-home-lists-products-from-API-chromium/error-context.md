# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog-browse.spec.ts >> catalog browse >> home lists products from API
- Location: e2e/catalog-browse.spec.ts:12:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "This page did not load" [level=1] [ref=e4]
  - paragraph [ref=e5]: Something went wrong. Try again or go back home.
  - generic [ref=e6]:
    - button "Try again" [ref=e7]
    - link "Home" [ref=e8] [cursor=pointer]:
      - /url: /
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
> 13 |     const responsePromise = page.waitForResponse(
     |                                  ^ Error: page.waitForResponse: Test timeout of 60000ms exceeded.
  14 |       (resp) => resp.url().includes("/api/v1/products") && resp.status() === 200,
  15 |     );
  16 |     await page.goto("/");
  17 |     await responsePromise;
  18 |     await expect(
  19 |       page.getByRole("heading", { name: /Custom Photo Frame|Porta-retrato personalizado/i }).first(),
  20 |     ).toBeVisible({
  21 |       timeout: 15_000,
  22 |     });
  23 |   });
  24 | 
  25 |   test("categories page shows seeded category", async ({ page }) => {
  26 |     const responsePromise = page.waitForResponse(
  27 |       (resp) => resp.url().includes("/api/v1/categories") && resp.status() === 200,
  28 |     );
  29 |     await page.goto("/categories");
  30 |     await responsePromise;
  31 |     await expect(page.getByText(/Miniatures|Miniaturas/i)).toBeVisible({ timeout: 15_000 });
  32 |   });
  33 | 
  34 |   test("search finds product by contract example name", async ({ page }) => {
  35 |     const responsePromise = page.waitForResponse(
  36 |       (resp) => resp.url().includes("/api/v1/products") && resp.status() === 200,
  37 |     );
  38 |     await page.goto("/search?q=custom");
  39 |     await responsePromise;
  40 |     await expect(page.getByText(/Custom Photo Frame|Porta-retrato personalizado/i)).toBeVisible({
  41 |       timeout: 15_000,
  42 |     });
  43 |   });
  44 | });
  45 | 
```