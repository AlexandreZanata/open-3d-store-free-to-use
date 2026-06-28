# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: i18n-locale.spec.ts >> locale switch >> switching language updates navigation labels
- Location: e2e/i18n-locale.spec.ts:14:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'PT', exact: true })

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
  2  |  * Contract: docs/features/i18n.md — EN ↔ PT-BR visible copy changes
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | const hasDatabase = Boolean(process.env.DATABASE_URL);
  7  | const apiBase = process.env.VITE_API_BASE_URL ?? "http://localhost:3010/api/v1";
  8  | 
  9  | test.describe.configure({ mode: "serial" });
  10 | 
  11 | test.describe("locale switch", () => {
  12 |   test.skip(!hasDatabase, "Requires DATABASE_URL and seeded catalog");
  13 | 
  14 |   test("switching language updates navigation labels", async ({ page }) => {
  15 |     await page.goto("/");
  16 | 
> 17 |     await page.getByRole("button", { name: "PT", exact: true }).click();
     |                                                                 ^ Error: locator.click: Test timeout of 60000ms exceeded.
  18 |     await expect(page.getByRole("link", { name: "Buscar", exact: true })).toBeVisible({
  19 |       timeout: 10_000,
  20 |     });
  21 | 
  22 |     await page.getByRole("button", { name: "EN", exact: true }).click();
  23 |     await expect(page.getByRole("link", { name: "Search", exact: true })).toBeVisible({
  24 |       timeout: 10_000,
  25 |     });
  26 |   });
  27 | 
  28 |   test("API returns localized catalog per Accept-Language", async ({ request }) => {
  29 |     const en = await request.get(`${apiBase}/products/custom-photo-frame`, {
  30 |       headers: { "Accept-Language": "en" },
  31 |     });
  32 |     expect(en.ok()).toBeTruthy();
  33 |     expect((await en.json()).data.name).toBe("Custom Photo Frame");
  34 | 
  35 |     const pt = await request.get(`${apiBase}/products/custom-photo-frame`, {
  36 |       headers: { "Accept-Language": "pt-BR" },
  37 |     });
  38 |     expect(pt.ok()).toBeTruthy();
  39 |     expect((await pt.json()).data.name).toBe("Porta-retrato personalizado");
  40 |   });
  41 | });
  42 | 
```