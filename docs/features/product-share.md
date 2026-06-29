# Product share

Share actions on the product detail page let customers send a **canonical product URL** with title and short description.

## UX

| Platform | Behavior |
|----------|----------|
| **Mobile (iOS/Android)** | Uses the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) when available — opens the system sheet (WhatsApp, Messages, Mail, etc.) |
| **Desktop / unsupported browsers** | Opens a popover with **Copy link**, **WhatsApp**, and **Email** |

Toast feedback confirms copy/share success (`sonner`).

## URL format

```
{origin}/product/{slug}
```

Example: `https://yourdomain.com/product/dragon-figurine`

Payload text:

```
{product name} — {short description}
{url}
```

## Implementation

| File | Role |
|------|------|
| `apps/web/src/lib/share.ts` | Pure URL/payload builders + clipboard helper |
| `apps/web/src/components/ShareProductButton.tsx` | Product page share control |
| `apps/web/src/components/ProductDetail/ProductDetailInfo.tsx` | Mobile favorite/share row in product info |
| `apps/web/src/components/ProductDetail/ProductDetailActions.tsx` | Desktop favorite/share; mobile sticky cart bar |
| `apps/web/src/routes/product.$slug.tsx` | Wires product detail page |

WhatsApp share uses `https://wa.me/?text=…` (user picks the chat). Email uses `mailto:` with subject and body.

Open Graph tags on the product route include `og:title`, `og:description`, and `og:type=product` for link previews.

**SSR (TanStack Start):** `ShareProductButton` resolves `window.location.origin` in `useEffect` only. Share menu links render after client mount so server render never touches `window`.

## Tests

| Layer | File |
|-------|------|
| Unit | `apps/web/tests/unit/share.test.ts` |
| E2E | `e2e/product-share.spec.ts`, `e2e/product-detail.spec.ts` (3D viewer after SSR) |
| i18n | `apps/web/tests/i18n-keys.test.ts` (key parity) |

## Manual check

1. Open `/product/custom-photo-frame` on desktop → click share → **Copy link** → paste; URL must match the browser origin + slug.
2. On mobile (or Chrome with Web Share enabled) → share opens the native sheet with title, text, and URL.
3. **WhatsApp** option opens `wa.me` with pre-filled message.

## Related

- [responsive-layout.md](responsive-layout.md) — product page action bar
- [i18n.md](i18n.md) — `product.share*` keys
