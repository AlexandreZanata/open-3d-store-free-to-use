# TDD Strategy

## Pyramid

| Layer | Tool | Target % |
|-------|------|----------|
| Unit | Vitest | 70% |
| Integration | Supertest + test DB | 25% |
| E2E | Playwright (future) | 5% |

Domain layer target: **≥ 90% coverage**.

Harness: `agent-rules/04-testing/test-pyramid.md`, `agent-rules/04-testing/coverage-gates.md`

## Test locations

| Package / app | Test directory |
|---------------|----------------|
| `@print3d/whatsapp` | `packages/whatsapp/tests/` |
| `@print3d/cep` | `packages/cep/tests/` |
| `apps/api` unit | `apps/api/tests/unit/` |
| `apps/api` integration | `apps/api/tests/integration/` |

## Vitest config — `apps/api/vitest.config.ts`

| Setting | Value |
|---------|-------|
| environment | node |
| globals | false |
| coverage provider | v8 |
| line threshold | 80% |
| function threshold | 80% |
| branch threshold | 70% |
| setupFiles | `./tests/setup.ts` |

## Required test suites by phase

| Phase | Tests |
|-------|-------|
| 1 | WhatsApp link builder (14 tests), CEP lookup (9 tests) — **done** |
| 2 | DB schema integration (3 tests) — **done** |
| 3 | Price, Slug value objects |
| 4 | Repository integration (Postgres) |
| 5 | Use cases with mocked repos |
| 6 | HTTP routes via `app.inject()` |

## TDD workflow (mandatory)

1. Write failing test
2. Implement minimum code to pass
3. Refactor within size limits (≤80 lines/function)
4. Run `pnpm vitest run` before commit

Harness: `agent-rules/04-testing/tdd.md`

## Example test files (reference)

Documented in original spec — implement in target paths listed in phase files.

## Related documents

- `.local/phases/` — each phase lists test done-conditions
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `agent-rules/04-testing/mocking-boundaries.md`
