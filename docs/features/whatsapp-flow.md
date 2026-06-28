# WhatsApp Redirect Flow

## Overview

No payment gateway. User configures order → API captures intent → returns `wa.me` deep link → user completes on WhatsApp.

## Package

**Name:** `@print3d/whatsapp`  
**Path:** `packages/whatsapp/src/link-builder.ts`

### Exports

- `generateWhatsAppLink(options: WhatsAppLinkOptions): string`

### Options

| Field | Type | Notes |
|-------|------|-------|
| `phoneNumber` | string | E.164 without `+`: `5565999999999` |
| `orderId` | string | UUIDv7 |
| `items` | array | `{ productName, quantity, selectedOptions, unitPrice }` |
| `customerName` | string? | |
| `customerNote` | string? | |
| `totalCents` | number | Integer BRL cents |

## Message template (Portuguese — customer-facing)

WhatsApp messages to Brazilian customers use Portuguese formatting:

```
🖨️ *Pedido - Impressão 3D*

*Cliente:* Maria
*Nº do pedido:* A1B2C3D4

*Itens:*
▪ 2x Custom Photo Frame
  • Color: White
  • Name to engrave: John
  Subtotal: R$ 90,00

*Total estimado: R$ 90,00*

*Observação:* Need fast delivery

_Olá! Gostaria de confirmar este pedido._
```

> Code and docs in English; WhatsApp message body may use Portuguese for end customers.

## CaptureOrder use case flow

1. Validate all `productId` values exist
2. Build line items with **current** prices (frozen at capture)
3. Generate WhatsApp link via `@print3d/whatsapp`
4. Persist `OrderCapture` + `totalCents` for analytics
5. Emit `order.captured` domain event

**File:** `apps/api/src/application/use-cases/CaptureOrder.ts`

## Environment

```bash
WHATSAPP_PHONE_NUMBER=5565999999999
```

Validated at startup — see [../infrastructure/environment.md](../infrastructure/environment.md).

## Tests (required before Phase 1 done)

**File:** `packages/whatsapp/tests/link-builder.test.ts`

Minimum 6 tests: URL format, encoding, product name, BRL total, customer name present/absent.

## Harness rules

- `agent-rules/03-security/input-validation.md`
- `agent-rules/07-data-management/pii-and-data-retention.md` — customer name/note retention policy

## Related documents

- [../api/contract.md](../api/contract.md) — `POST /orders/capture`
- [../architecture/domain-model.md](../architecture/domain-model.md)
- `.local/phases/01-shared-packages.md`, `.local/phases/05-application-layer.md`
