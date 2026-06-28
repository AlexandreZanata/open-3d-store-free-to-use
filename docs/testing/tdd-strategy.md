# TDD Strategy

> **Before any test work:** read [README.md](README.md) → [contract-first-testing.md](contract-first-testing.md).

## Pyramid

| Layer | Tool | Target % | Contract source |
|-------|------|----------|-----------------|
| **Unit** | Vitest | 70% | Domain model, feature docs |
| **Integration** | Vitest + Supertest + test DB | 25% | `docs/api/contract.md` |
| **E2E** | Playwright | 5% | System overview + feature journeys |

Domain layer target: **≥ 90% coverage** on value objects and pure domain code.

Harness: `agent-rules/04-testing/test-pyramid.md`, `agent-rules/04-testing/coverage-gates.md`

## Policy summary

| Rule | Detail |
|------|--------|
| Contract-first | Tests derived from **docs**, not from reading implementation |
| Immutable contract tests | Change doc → test → code (never reverse) |
| Must fail on violation | If code drifts from contract, CI MUST go red |
| No mirror tests | Never duplicate production logic in test assertions |
| Automated + manual | CI runs unit/integration/E2E; manual for 3D/WhatsApp device only |

Full policy: [contract-first-testing.md](contract-first-testing.md)

## Test locations

| Package / app | Unit | Integration | E2E |
|---------------|------|-------------|-----|
| `@print3d/whatsapp` | `packages/whatsapp/tests/` | — | — |
| `@print3d/cep` | `packages/cep/tests/` | — | — |
| `apps/api` | `apps/api/tests/unit/` | `apps/api/tests/integration/` | — |
| Full stack | — | — | `e2e/` (Playwright, Phase 7+) |

## Vitest — `apps/api/vitest.config.ts`

| Setting | Value |
|---------|-------|
| environment | node |
| globals | false |
| coverage provider | v8 |
| line threshold | 80% |
| function threshold | 80% |
| branch threshold | 70% |
| setupFiles | `./tests/setup.ts` |

## Playwright E2E (Phase 7+)

| Setting | Value |
|---------|-------|
| Directory | `e2e/` |
| Config | `playwright.config.ts` (repo root) |
| Browsers | Chromium (CI); Firefox/WebKit optional locally |
| Base URL | `http://localhost:5173` (web dev server) |
| API | Real API or web `page.request` against `http://localhost:3001` |

### Root scripts (target)

```json
{
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui"
}
```

### Minimum E2E suites

| Spec | Journey | Contract ref |
|------|---------|--------------|
| `catalog-browse.spec.ts` | Home → categories → product list | `docs/api/contract.md` |
| `product-detail-3d.spec.ts` | Product page loads model container | `docs/features/3d-viewer.md` |
| `order-whatsapp.spec.ts` | Cart → capture → `wa.me` redirect | `docs/features/whatsapp-flow.md` |
| `i18n-locale.spec.ts` | Switch EN ↔ PT; visible copy changes | `docs/features/i18n.md` |

E2E tests use **documented** URLs, status codes, and visible text — not implementation selectors copied from components.

## Required test suites by phase

| Phase | Automated tests | Manual (additional) |
|-------|-----------------|---------------------|
| 1 | WhatsApp unit (14), CEP unit (9) — **done** | Node dist smoke |
| 2 | Schema integration (3) — **done** | `psql \dt`, uuidv7 |
| 3 | Price, Slug, Locale unit | — |
| 4 | Repository integration + search EN/PT | — |
| 5 | Use case unit (mocked repos) | — |
| 6 | HTTP route integration (`app.inject`) | `curl` smoke |
| 7 | i18n key parity; **Playwright E2E** (4 suites) | 3D visual, WhatsApp app |
| 8 | Full CI pipeline (unit + integration + E2E) | Production smoke |

## TDD workflow (mandatory)

1. **Read** [contract-first-testing.md](contract-first-testing.md)
2. **Read** contract/feature doc for expected behavior
3. Write **failing** test — expected values from docs only
4. Confirm **RED** (meaningful failure)
5. Implement minimum code
6. Confirm **GREEN**
7. Refactor **code only** — never weaken assertions
8. Run `pnpm turbo test` and `pnpm e2e` (when E2E exists) before commit

Harness: `agent-rules/04-testing/tdd.md`

## CI gates

See [../operations/ci-cd.md](../operations/ci-cd.md):

1. `pnpm install --frozen-lockfile`
2. `pnpm turbo build`
3. `pnpm turbo test` — all packages
4. `pnpm e2e` — Playwright (Phase 7+)
5. `pnpm turbo lint`

## Related documents

- [README.md](README.md) — mandatory read order
- [contract-first-testing.md](contract-first-testing.md) — restrictive policy
- [../api/contract.md](../api/contract.md)
- `.local/phases/` — per-phase test tasks
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.cursor/rules/contract-first-testing.mdc`
- `agent-rules/04-testing/mocking-boundaries.md`
