# Explicitly Rejected Options

> Do not re-introduce these without an ADR in `docs/adr/` (use `agent-rules/11-documentation-and-glossary/adr-template.md`).

| Option | Reason rejected |
|--------|-----------------|
| Go / Rust backend | Separate language = higher cognitive load for solo dev |
| Next.js API routes | Couples frontend and backend; harder to scale independently |
| Prisma ORM | Heavy runtime, slow migrations, poor DX for complex queries |
| S3 / Cloudflare R2 | Cost and complexity; local storage + Nginx sufficient at this scale |
| Microservices | Operational overhead not justified for load profile |
| MongoDB | PostgreSQL JSONB covers flexible attributes; relational integrity matters |
| Lovable vite config | Vendor lock-in; replaced with standard TanStack Start Vite config |
| Payment gateway | Out of scope — WhatsApp handles transactions |
| More than 2 UI locales | Scope locked to `en` + `pt-BR` only — see [../features/i18n.md](../features/i18n.md) |
| Hardcoded UI strings | All user-visible copy must use i18n keys |
| Mirror tests | Copying implementation logic into test expectations — see [../testing/contract-first-testing.md](../testing/contract-first-testing.md) |
| Weakening contract tests to match code | Change doc first, then test, then code |
| Google Translate / runtime MT | Quality and cost; manual translations for 2 locales |
| Separate DB row per locale | JSONB `translations` column is simpler for solo maintainer |

## Related documents

- [technology-decisions.md](technology-decisions.md)
- [../architecture/constraints.md](../architecture/constraints.md)
