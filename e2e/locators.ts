import { expect, type Locator, type Page } from "@playwright/test";

/** Responsive layouts keep hidden breakpoint twins in the DOM — target visible nodes only. */
export function visible(locator: Locator): Locator {
  return locator.locator("visible=true");
}

/** Radix share popover can miss the first click while payload resolves — retry until open. */
export async function openShareMenu(page: Page): Promise<Locator> {
  const shareBtn = page.getByRole("main").getByRole("button", { name: /share|compartilhar/i });
  const menu = page.locator('[data-state="open"]');
  await expect
    .poll(
      async () => {
        if (!(await menu.isVisible())) {
          await shareBtn.click();
        }
        return menu.getByRole("button", { name: /copy link|copiar link/i }).isVisible();
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  return menu;
}
