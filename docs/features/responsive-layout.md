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
| **Navigation** | Fixed bottom 5-tab bar (`h-[3.75rem]`, `z-50`, `data-testid="mobile-tab-bar"`); active tab uses **filled black icon** (no accent dot) |
| **Home** | Hero card + category pills + horizontal product rails; mobile hero tile shows rotating **3D Corvo logo** (`HeroLogoViewer` compact); product thumbnails stay visible when returning via bottom nav (no multi-second blank flash — see [catalog-realtime.md](catalog-realtime.md) thumbnail warm cache); **PETG HF** material pill on cards uses **solid orange** (`bg-orange-500`, white text) for contrast on dark thumbnails |
| **Shell** | `max-w-2xl`, flex column with site footer above tab bar |

### Site footer (`AppShellFooter`)

Global footer on every page wrapped by `AppShell`:

| Element | Detail |
|---------|--------|
| **Surface** | Inverted dark bar (`bg-foreground`) — matches desktop header main tier |
| **Pitch** | Bilingual CTA — compact `text-xs` on mobile, `text-base` on desktop |
| **Contact links** | `size-11` icon buttons on mobile; icon + label on desktop (`lg+`) |
| **WhatsApp** | `VITE_WHATSAPP_PHONE` (same digits as API `WHATSAPP_PHONE_NUMBER`) with brand icon |
| **Instagram** | `VITE_INSTAGRAM_URL` — official project profile |
| **GitHub** | [AlexandreZanata](https://github.com/AlexandreZanata) |
| **Email** | `alexandrezanatavasconcelos@gmail.com` |

Mobile footer uses `footerBottomPad` so content clears the fixed bottom tab bar.

### Mobile tab bar — visual viewport pinning

On Android Chrome, scrolling **up** can resize the browser toolbar so the **visual viewport** bottom no longer matches `position: fixed; bottom: 0`. Without compensation, page content bleeds through a thin strip below the tab bar.

| Piece | Contract |
|-------|----------|
| **CSS variable** | `--vv-bottom-inset` on `document.documentElement` |
| **Formula** | `max(0, round(innerHeight - visualViewport.height - visualViewport.offsetTop))` |
| **Tab bar anchor** | `bottom: 0` on `mobile-tab-bar-shell` — **never** lift via `bottom: var(--vv-bottom-inset)` |
| **Chrome + safe area** | `mobile-tab-bar-fill` (absolute, `height: safe-area + vv-inset`) + `mobile-tab-bar-row` (`margin-bottom` same) — icon row sits flush above filler; opaque `bg-background` reaches layout viewport bottom |
| **Document flow** | `footerBottomPad` and `mobileProductScrollSpacer` use tab bar height + safe-area only — **no** `vv-bottom-inset` (prevents scroll-height churn) |
| **Stacked fixed UI** | `mobileStackAboveTabBar` MUST include `var(--vv-bottom-inset, 0px)` |

When `--vv-bottom-inset > 0`, the shell’s **outer** bottom edge MUST equal `window.innerHeight` (±2px) with fully opaque `bg-background`; tab icons sit directly above the filler (no dead padding inside the icon row).

**Inset stabilization:** `--vv-bottom-inset` MUST NOT change during active `visualViewport` scroll/resize (or coalesced `window` resize) — only after **120ms** idle, commit the live measured inset. This prevents the tab bar from jumping up then down mid-gesture on Android. `matchMedia` breakpoint changes apply immediately.

`html, body` use `overscroll-behavior-y: none` on mobile to reduce rubber-band fighting fixed chrome.

Sync runs only below `lg` (`max-width: 1023px`) via `useVisualViewportBottomInset` mounted in `AppShell`.

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
| `apps/web/src/lib/layout.ts` | Shared Tailwind tokens + `MOBILE_VIEWPORT_MQ` |
| `apps/web/src/lib/catalogPrefetch.ts` | Mobile catalog prefetch (see [catalog-performance.md](catalog-performance.md)) |
| `apps/web/src/components/AppShell.tsx` | Shell orchestration |
| `apps/web/src/components/AppShellMobileHeader.tsx` | **Frozen** mobile header |
| `apps/web/src/components/AppShellDesktopHeader.tsx` | Desktop inverted header |
| `apps/web/src/components/AppShellMobileNav.tsx` | Mobile bottom tabs |
| `apps/web/src/components/AppShellFooter.tsx` | Site footer (contact CTA) |
| `apps/web/src/components/home/HomeDesktopView.tsx` | Desktop-only home |
| `apps/web/src/components/home/HomeMobileHero.tsx` | Mobile featured hero card with 3D logo |
| `apps/web/src/components/home/HeroLogoViewer.tsx` | Shared Corvo GLB turntable (desktop + mobile); pauses off-screen instead of disposing; warms GLB only when hero slot is visible |
| `apps/web/src/components/home/HeroLogoPlaceholder.tsx` | Solid black corvo PNG fallback (`brightness-0`) — same fit ratio as hero GLB |
| `apps/web/src/lib/heroLogo.ts` | Hero GLB URL + `preloadHeroLogo()` |
| `apps/web/src/lib/favoriteCache.ts` | Visitor favorite-id cache for instant empty state |
| `apps/web/src/lib/visualViewportInset.ts` | Pure inset calculator for `--vv-bottom-inset` |
| `apps/web/src/lib/visualViewportBottomInsetSync.ts` | Inset stabilization + listener wiring |
| `apps/web/src/hooks/useVisualViewportBottomInset.ts` | Syncs visual viewport gap to CSS variable (mobile only) |
| `apps/web/src/hooks/useFooterInView.ts` | Hides mobile sticky product actions when footer intersects sticky zone |
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
| Unit | `apps/web/tests/unit/visualViewportInset.test.ts` — inset formula from this doc |
| Unit | `apps/web/tests/unit/contact.test.ts` |
| E2E desktop | `e2e/desktop-layout.spec.ts` — 1280×800 |
| E2E product | `e2e/product-detail.spec.ts` — 3D viewer + gallery carousel |
| E2E mobile | `e2e/desktop-layout.spec.ts` — 390×844 preserved UI |
| E2E mobile UX | `e2e/mobile-ux.spec.ts` — guest favorites, sticky bar vs footer, tab bar viewport pinning |
| E2E catalog nav | `e2e/catalog-navigation.spec.ts` — home → product → home thumbnail persistence (mobile) |
| E2E catalog perf | `e2e/catalog-performance.spec.ts` — mobile tab prefetch + cold load |

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 pnpm e2e e2e/desktop-layout.spec.ts
```

## Manual validation

1. **Mobile (390px)** — bottom tabs, compact header, horizontal rails, no desktop nav.
2. **Desktop (≥1280px)** — dark inverted header, labeled Cart, desktop hero, category cards, product grids, no bottom tabs.
3. **Resize** — crossing 1024px toggles layouts without breaking either experience.
4. **Product cards** — home rails and search grid show **square** image tiles (same width, 1:1 aspect) on mobile and desktop.
5. **Home return navigation (mobile)** — open home, tap a product, wait 5s, bottom-nav back to home: product thumbnails visible within 1s (no gray/white tiles for 3s).
6. **Product detail** — `/product/phone-stand`: gallery tab shows carousel with multiple images; `/product/custom-photo-frame`: 3D tab shows virtual desk viewer (drag to rotate, scroll to zoom). On mobile (390px), favorite and share appear below material; **Pedir pelo WhatsApp** opens WhatsApp directly (green button) without visiting cart first.
7. **Footer** — dark inverted bar, pitch text, WhatsApp + Instagram + GitHub + email; icon-only on mobile, labeled on desktop.
8. **Tab bar viewport (Android)** — on a product page, scroll down then scroll up aggressively near the footer: no page content (e.g. green WhatsApp button or dark footer) visible in a strip below the bottom tab bar; shell outer edge stays flush with the screen bottom and opaque.

## Related

- [i18n.md](i18n.md)
- [3d-viewer.md](3d-viewer.md)
- [catalog-performance.md](catalog-performance.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
