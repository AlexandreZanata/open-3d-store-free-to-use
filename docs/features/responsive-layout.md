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
| **Header** | `AppShellMobileHeader` — fixed top bar (`h-14`), main content uses `mobileTopPad` |
| **Navigation** | Fixed bottom 5-tab bar (`h-[3.75rem]`, `z-50`); active tab uses **filled black icon** (no accent dot) |
| **Home** | Hero card + category pills + horizontal product rails; mobile hero tile shows rotating **3D Corvo logo** (`HeroLogoViewer` compact) |
| **Shell** | `max-w-2xl`, flex column with site footer above tab bar |

### Site footer (`AppShellFooter`)

Global footer on every page wrapped by `AppShell`:

| Element | Detail |
|---------|--------|
| **Surface** | Inverted dark bar (`bg-foreground`) — matches desktop header main tier |
| **Pitch** | Bilingual CTA — compact `text-xs` on mobile, `text-base` on desktop |
| **Contact links** | `size-11` icon buttons on mobile; icon + label on desktop (`lg+`) |
| **WhatsApp** | `VITE_WHATSAPP_PHONE` (same digits as API `WHATSAPP_PHONE_NUMBER`) with brand icon |
| **GitHub** | [AlexandreZanata](https://github.com/AlexandreZanata) |
| **Email** | `alexandrezanatavasconcelos@gmail.com` |

Mobile footer uses `footerBottomPad` so content clears the fixed bottom tab bar.

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
| **Hero** | Full-width split layout, subtitle, dual CTAs, **rotating 3D Corvo logo** (`HeroLogoViewer` + `/models/3d/corvo-logo-preview.glb`) |
| **Categories** | Card grid (not pills) |
| **Products** | Multi-column grids with section headers; product cards use **square** thumbnails (`productCardImageAspect`) |

### Other pages

| Page | Desktop |
|------|---------|
| **Search** | Page intro, sticky filter card sidebar, prominent search field, catalog product cards (`2–3` cols) with **square** image tiles |
| **Categories** | 3–4 column grid |
| **Product** | Two columns (media panel + details); sticky media on desktop; Embla gallery carousel; share button (Web Share + copy/WhatsApp/email) — [product-share.md](product-share.md) |
| **Product (mobile)** | Vertical info stack (title → subtitle → price → material → favorite/share → description → tags); sticky cart + WhatsApp bar above tab nav — **auto-hides when footer is visible** so contact icons stay tappable |
| **Favorites (mobile)** | Empty state renders immediately (cached visitor ids); skeleton only when rehydrating a non-empty list |
| **Cart** | Centered `max-w-3xl` column |

## Key files

| File | Role |
|------|------|
| `apps/web/src/lib/layout.ts` | Shared Tailwind tokens |
| `apps/web/src/components/AppShell.tsx` | Shell orchestration |
| `apps/web/src/components/AppShellMobileHeader.tsx` | **Frozen** mobile header |
| `apps/web/src/components/AppShellDesktopHeader.tsx` | Desktop inverted header |
| `apps/web/src/components/AppShellMobileNav.tsx` | Mobile bottom tabs |
| `apps/web/src/components/AppShellFooter.tsx` | Site footer (contact CTA) |
| `apps/web/src/components/home/HomeDesktopView.tsx` | Desktop-only home |
| `apps/web/src/components/home/HomeMobileHero.tsx` | Mobile featured hero card with 3D logo |
| `apps/web/src/components/home/HeroLogoViewer.tsx` | Shared Corvo GLB turntable (desktop + mobile); pauses off-screen instead of disposing; preloads GLB |
| `apps/web/src/lib/heroLogo.ts` | Hero GLB URL + `preloadHeroLogo()` |
| `apps/web/src/lib/favoriteCache.ts` | Visitor favorite-id cache for instant empty state |
| `apps/web/src/hooks/useFooterInView.ts` | Hides mobile sticky product actions when footer intersects |
| `apps/web/src/components/SearchFiltersPanel.tsx` | Search filters (mobile chips / desktop list) |
| `apps/web/src/components/search/SearchDesktopView.tsx` | Desktop-only search layout |
| `apps/web/src/components/search/SearchMobileView.tsx` | **Frozen** mobile search UI |
| `apps/web/src/components/search/CatalogProductCard.tsx` | Desktop catalog card for search (square thumbnail) |
| `apps/web/src/components/ProductDetail/ProductDetailInfo.tsx` | Product title stack + specs (mobile/desktop layouts) |
| `apps/web/src/components/ProductDetail/ProductDetailActions.tsx` | Cart / WhatsApp bar; desktop share + favorite |
| `apps/web/src/components/ProductMedia/ProductMediaPanel.tsx` | Product 3D viewer + gallery tabs |
| `apps/web/src/components/ProductMedia/ProductImageCarousel.tsx` | Multi-image Embla carousel |

## Testing

| Layer | File |
|-------|------|
| Unit | `apps/web/tests/layout.test.ts` |
| Unit | `apps/web/tests/unit/contact.test.ts` |
| E2E desktop | `e2e/desktop-layout.spec.ts` — 1280×800 |
| E2E product | `e2e/product-detail.spec.ts` — 3D viewer + gallery carousel |
| E2E mobile | `e2e/desktop-layout.spec.ts` — 390×844 preserved UI |
| E2E mobile UX | `e2e/mobile-ux.spec.ts` — guest favorites, sticky bar vs footer, favorites empty state |

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 pnpm e2e e2e/desktop-layout.spec.ts
```

## Manual validation

1. **Mobile (390px)** — bottom tabs, compact header, horizontal rails, no desktop nav.
2. **Desktop (≥1280px)** — dark inverted header, labeled Cart, desktop hero, category cards, product grids, no bottom tabs.
3. **Resize** — crossing 1024px toggles layouts without breaking either experience.
4. **Product cards** — home rails and search grid show **square** image tiles (same width, 1:1 aspect) on mobile and desktop.
5. **Product detail** — `/product/phone-stand`: gallery tab shows carousel with multiple images; `/product/custom-photo-frame`: 3D tab shows virtual desk viewer (drag to rotate, scroll to zoom). On mobile (390px), favorite and share appear below material; cart actions stay in the sticky bar.
6. **Footer** — dark inverted bar, pitch text, icon-only contact buttons on mobile, labeled links on desktop.

## Related

- [i18n.md](i18n.md)
- [3d-viewer.md](3d-viewer.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
