# System Overview

## What this system is

A **product catalog and order-capture platform** for a 3D printing shop. Users browse products, configure custom options, preview models in 3D, and are redirected to WhatsApp to complete the order.

There is **no payment gateway**. The backend serves catalog data, handles file storage, generates WhatsApp deep-links, and tracks basic analytics.

## Core user journey

```
User lands on site
  → Browse catalog (products, categories, filters)
  → Select product → configure options (color, size, material)
  → View 3D model of product (.glb / .gltf)
  → Click "Order via WhatsApp"
  → System generates pre-filled WhatsApp message with order summary
  → User is redirected to wa.me deep link
  → Conversation continues on WhatsApp (off-platform)
```

## Traffic model

| Characteristic | Detail |
|----------------|--------|
| Target load | Thousands of concurrent users, spike-tolerant |
| Workload | Read-heavy (catalog browsing >> order actions) |
| Real-time | Optional SSE on `GET /catalog/events` — storefront invalidates React Query on admin catalog writes ([catalog-realtime.md](../features/catalog-realtime.md)) |
| Caching | Most pages are cacheable |

## Bounded context

Single bounded context: **Catalog & Order Capture**.

No payment context, no fulfillment context (WhatsApp), no user account context (anonymous browsing).

## Internationalization

The storefront is **fully bilingual** (`en` + `pt-BR`). Users pick a language via switcher or browser preference; catalog API returns locale-specific product copy. WhatsApp order messages remain Portuguese. See [../features/i18n.md](../features/i18n.md).

See [domain-model.md](domain-model.md) for aggregates and events.

## Related documents

| Topic | Document |
|-------|----------|
| Constraints | [constraints.md](constraints.md) |
| i18n | [../features/i18n.md](../features/i18n.md) |
| Stack | [../stack/technology-decisions.md](../stack/technology-decisions.md) |
| API | [../api/contract.md](../api/contract.md) |
| 3D viewer | [../features/3d-viewer.md](../features/3d-viewer.md) |
| WhatsApp | [../features/whatsapp-flow.md](../features/whatsapp-flow.md) |
