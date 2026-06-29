# Responsive layout (mobile + desktop)

The AXIS web app is **mobile-first**. Viewports below **1024px (`lg`)** keep the original phone UI unchanged. At `lg` and above, the app uses a **separate desktop design** — not a stretched mobile layout.

## Breakpoint

| Viewport | Behavior |
|----------|----------|
| `< 1024px` | Original mobile UI — compact header, bottom tab bar, horizontal rails |
| `≥ 1024px` | Desktop UI — inverted header, utility strip, dedicated home layout, grids |

Implementation tokens live in `apps/web/src/lib/layout.ts`.

## Mobile (unchanged)

| Element | Detail |
|---------|--------|
| **Header** | `AppShellMobileHeader` — frozen markup, no `lg:` classes |
| **Navigation** | Fixed bottom 5-tab bar |
| **Home** | Hero card + category pills + horizontal product rails |
| **Shell** | `max-w-2xl`, `pb-24` for tab bar clearance |

## Desktop design (lg+)

### Header (`AppShellDesktopHeader`)

Two-tier professional header, visually distinct from mobile:

| Tier | Content |
|------|---------|
| **Utility strip** | Tagline + “Order via WhatsApp” · language switcher |
| **Main bar** | Inverted (`bg-foreground`) — logo, text nav with accent underline, search field, labeled Cart CTA |

### Home (`HomeDesktopView`)

Separate desktop-only home — mobile home is wrapped in `lg:hidden`:

| Section | Desktop |
|---------|---------|
| **Hero** | Full-width split layout, subtitle, dual CTAs, decorative 3D motif |
| **Categories** | Card grid (not pills) |
| **Products** | Multi-column grids with section headers |

### Other pages

| Page | Desktop |
|------|---------|
| **Search** | Page intro, sticky filter card sidebar, prominent search field, catalog product cards (`2–3` cols) |
| **Categories** | 3–4 column grid |
| **Product** | Two columns (media panel + details); sticky media on desktop; Embla gallery carousel |
| **Cart** | Centered `max-w-3xl` column |

## Key files

| File | Role |
|------|------|
| `apps/web/src/lib/layout.ts` | Shared Tailwind tokens |
| `apps/web/src/components/AppShell.tsx` | Shell orchestration |
| `apps/web/src/components/AppShellMobileHeader.tsx` | **Frozen** mobile header |
| `apps/web/src/components/AppShellDesktopHeader.tsx` | Desktop inverted header |
| `apps/web/src/components/AppShellMobileNav.tsx` | Mobile bottom tabs |
| `apps/web/src/components/home/HomeDesktopView.tsx` | Desktop-only home |
| `apps/web/src/components/SearchFiltersPanel.tsx` | Search filters (mobile chips / desktop list) |
| `apps/web/src/components/search/SearchDesktopView.tsx` | Desktop-only search layout |
| `apps/web/src/components/search/SearchMobileView.tsx` | **Frozen** mobile search UI |
| `apps/web/src/components/search/CatalogProductCard.tsx` | Desktop catalog card for search |
| `apps/web/src/components/ProductMedia/ProductMediaPanel.tsx` | Product 3D viewer + gallery tabs |
| `apps/web/src/components/ProductMedia/ProductImageCarousel.tsx` | Multi-image Embla carousel |

## Testing

| Layer | File |
|-------|------|
| Unit | `apps/web/tests/layout.test.ts` |
| E2E desktop | `e2e/desktop-layout.spec.ts` — 1280×800 |
| E2E product | `e2e/product-detail.spec.ts` — 3D viewer + gallery carousel |
| E2E mobile | `e2e/desktop-layout.spec.ts` — 390×844 preserved UI |

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 pnpm e2e e2e/desktop-layout.spec.ts
```

## Manual validation

1. **Mobile (390px)** — bottom tabs, compact header, horizontal rails, no desktop nav.
2. **Desktop (≥1280px)** — dark inverted header, labeled Cart, desktop hero, category cards, product grids, no bottom tabs.
3. **Resize** — crossing 1024px toggles layouts without breaking either experience.
4. **Product detail** — `/product/phone-stand`: gallery tab shows carousel with multiple images; `/product/custom-photo-frame`: 3D tab shows virtual desk viewer (drag to rotate, scroll to zoom).

## Related

- [i18n.md](i18n.md)
- [3d-viewer.md](3d-viewer.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
