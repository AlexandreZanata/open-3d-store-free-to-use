# CEP Validation & Lookup

## Package

**Name:** `@print3d/cep`  
**Path:** `packages/cep/src/cep.ts`  
**Source data:** `@br-validators/core/cep` — IBGE CNEFE Censo 2022 (offline, ~24k prefixes)

## Exports

| Function | Purpose |
|----------|---------|
| `parseCep(input)` | Validate + normalize to 8 digits + masked display |
| `formatCepDisplay(input)` | Mask only — `01310-100` or `null` |
| `lookupCep(input)` | Validate + resolve UF, city, IBGE code by prefix |
| `lookupCepPrefix(prefix)` | Lookup by 5-digit prefix |
| `listCepFaixas()` | Full embedded prefix dataset |
| `CEP_FAIXA_DATA_VERSION` | Dataset metadata (capture date, sources) |

Subpath import in implementation: `@br-validators/core/cep` only (tree-shakeable).

## Lookup result

```typescript
{
  ok: true,
  location: {
    cep: "01310100",
    display: "01310-100",
    prefixo: "01310",
    uf: "SP",
    codigoIbge: 3550308,
    cidade: "São Paulo"
  }
}
```

> Prefix lookup resolves **municipality** from IBGE CNEFE — not street-level Correios data. Full address APIs (Correios/ViaCEP) are out of scope for offline embed.

## Usage (API / frontend)

```typescript
import { lookupCep, formatCepDisplay } from "@print3d/cep";

const result = lookupCep("01310-100");
if (result.ok) {
  console.log(result.location.cidade, result.location.uf);
}
```

## Tests

**File:** `packages/cep/tests/cep.test.ts` — validate, format, lookup SP/RJ, prefix not found, dataset size.

## Related documents

- [../stack/technology-decisions.md](../stack/technology-decisions.md)
- [whatsapp-flow.md](whatsapp-flow.md) — phone validation (same library family)
- `@br-validators/core` on npm — [telefone + cep subpaths](https://www.npmjs.com/package/@br-validators/core)
