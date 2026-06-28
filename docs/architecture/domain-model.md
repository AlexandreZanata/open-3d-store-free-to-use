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

**i18n:** User-visible text (`name`, `description`, `shortDescription`, option labels) stored per locale in DB `translations` JSONB — keys `en` and `pt-BR` only. Slug is not translated. See [../features/i18n.md](../features/i18n.md).

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

**i18n:** `name` and `description` are locale-specific via `translations` JSONB (`en`, `pt-BR`). Slug is shared across locales.

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

### AdminUser (root — admin bounded context)

Separate from storefront. See [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | `DEFAULT uuidv7()` |
| `email` | string | Unique, normalized lowercase |
| `passwordHash` | string | argon2id — never exposed via API |
| `role` | `"admin"` | MVP single role; server-assigned only |
| `lastLoginAt` | timestamp \| null | Updated on successful login |
| `createdAt` | timestamp | Server-owned |
| `updatedAt` | timestamp | Server-owned |

Target types: `packages/shared-types/src/admin/auth.types.ts` (Phase 9)

### AuditLog (entity — append-only)

Security and compliance trail. Not a REST resource in MVP.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` | `DEFAULT uuidv7()` |
| `actorId` | uuid \| null | `admin_users.id`; null for failed login with unknown email |
| `action` | string | e.g. `admin.product.created`, `admin.login.failure` |
| `resourceType` | string | `product`, `category`, `upload`, `session` |
| `resourceId` | uuid \| null | Target entity when applicable |
| `payloadHash` | string | SHA-256 of redacted payload — not full body |
| `clientIp` | string | From `X-Forwarded-For` / socket |
| `occurredAt` | timestamp | Immutable |

Harness: `agent-rules/03-security/audit-logging.md`

## Admin write invariants

### Product writes (admin)

| Rule | Detail |
|------|--------|
| Slug uniqueness | Global unique across `products.slug` |
| Price | `basePrice` integer ≥ 0 (BRL cents) |
| Translations | Both `en` and `pt-BR` required on create; keys `name`, `description`, `shortDescription` |
| Delete | Hard delete only if no `order_captures` reference product; else use `status: discontinued` |
| Non-writable | `id`, `createdAt`, `updatedAt`, `role`, search vectors |

Maps to columns in `apps/api/src/infrastructure/db/schema.ts` (`products` table + `translations` JSONB).

### Category writes (admin)

| Rule | Detail |
|------|--------|
| Slug uniqueness | Global unique across `categories.slug` |
| Soft delete | `DELETE` sets `isActive: false`; public catalog hides inactive |
| Parent depth | One level nesting max (`parentId` → root or direct child) |
| Translations | Both locales required on create; `name` required, `description` nullable |
| Delete guard | Cannot soft-delete if active products reference category |

Contract: [../api/admin-contract.md](../api/admin-contract.md)

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

### Locale

- Supported values: `en`, `pt-BR` only
- `parse(input)` normalizes `pt` → `pt-BR`; rejects unsupported codes (e.g. `es`)
- Missing input defaults to `pt-BR` (API contract)
- `getFallbackChain()` → requested locale, then `en`, then `pt-BR` (deduplicated)

Target: `apps/api/src/domain/value-objects/Locale.ts`

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
- [../api/admin-contract.md](../api/admin-contract.md)
- [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md)
- [../features/i18n.md](../features/i18n.md)
- [../features/whatsapp-flow.md](../features/whatsapp-flow.md)
