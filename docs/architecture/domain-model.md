# Domain Model (DDD)

> Bounded context: **Catalog & Order Capture**. See [system-overview.md](system-overview.md).

## Aggregates

### Product (root)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | Primary key — `DEFAULT uuidv7()` (PostgreSQL 18.4 native) |
| `slug` | string | URL-friendly, unique |
| `name` | string | |
| `description` | string | |
| `shortDescription` | string | |
| `categoryId` | string | FK to Category |
| `basePrice` | number | **BRL cents — integer, never float** |
| `material` | `PLA \| PETG \| ABS \| TPU \| RESIN` | |
| `printTimeHours` | number | |
| `weightGrams` | number | |
| `status` | `active \| out_of_stock \| discontinued` | |
| `options` | `ProductOption[]` | JSONB in DB |
| `modelFileUrl` | string \| null | Nginx path e.g. `/models/3d/foo.glb` |
| `thumbnailUrl` | string | |
| `imageUrls` | string[] | |
| `tags` | string[] | |

**ProductOption:** `{ id, name, type: select|text|boolean, required, choices?, defaultValue? }`

Target types: `packages/shared-types/src/product.types.ts` (Phase 1)

### Category (root)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | Primary key — `DEFAULT uuidv7()` (PostgreSQL 18.4 native) |
| `slug` | string | unique |
| `name` | string | |
| `description` | string \| null | |
| `parentId` | string \| null | One level nesting max |
| `imageUrl` | string \| null | |
| `sortOrder` | number | |
| `isActive` | boolean | |

Target types: `packages/shared-types/src/category.types.ts` (Phase 1)

### OrderCapture (value object — analytics only)

Not a full aggregate. Persisted for analytics; no payment or fulfillment state.

| Field | Type |
|-------|------|
| `id` | `uuid` | UUIDv7 — generated in app before WhatsApp link, then persisted |
| `items` | `OrderLineItem[]` |
| `customerName` | string? |
| `customerNote` | string? |
| `capturedAt` | Date |
| `whatsappLink` | string |

**OrderLineItem:** `{ productId, productName, quantity, selectedOptions, unitPrice }` — price frozen at capture time.

Target types: `packages/shared-types/src/order.types.ts` (Phase 1)

## Value objects

### Price

- Always integer BRL cents
- `fromCents(cents)` validates ≥ 0 and integer
- `toDisplay()` → `R$ 45,00` format
- `add(other)` for totals

Target: `apps/api/src/domain/value-objects/Price.ts`

### Slug

- Normalized: lowercase, NFD strip, hyphen-separated
- Length 2–100 chars

Target: `apps/api/src/domain/value-objects/Slug.ts`

## Domain events

Stored in `domain_events` table (direct INSERT — no event bus).

| Event | Payload |
|-------|---------|
| `product.viewed` | `{ productId, sessionId }` |
| `order.captured` | `{ orderId, itemCount, totalCents }` |
| `whatsapp.clicked` | `{ orderId, timestamp }` |

Target: `apps/api/src/domain/events/DomainEvent.ts`

## Business rules (GIVEN/WHEN/THEN)

### BR-001: Price integrity

- **GIVEN** a product with `basePrice` in cents
- **WHEN** an order is captured
- **THEN** line item `unitPrice` MUST equal product `basePrice` at capture time (never recalculate from float)

### BR-002: Active products only

- **GIVEN** a product with `status !== 'active'`
- **WHEN** user attempts order capture
- **THEN** API returns 404 or 422 — product not orderable

### BR-003: Required options

- **GIVEN** a product option with `required: true`
- **WHEN** order capture request omits that option key
- **THEN** validation fails with 422

## Harness rules

- `agent-rules/02-architecture/layering.md`
- `agent-rules/02-architecture/state-machines.md` (product status)
- `agent-rules/11-documentation-and-glossary/ubiquitous-language.md`
- [GLOSSARY.md](../GLOSSARY.md)

## Related documents

- [backend-architecture.md](backend-architecture.md)
- [../api/contract.md](../api/contract.md)
- [../features/whatsapp-flow.md](../features/whatsapp-flow.md)
