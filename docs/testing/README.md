# Testing — Read This First

> **STOP.** Agents and developers MUST read this page **before creating, editing, or reviewing any test file**.

## Mandatory reading order

| Order | Document | When |
|-------|----------|------|
| **1** | [contract-first-testing.md](contract-first-testing.md) | **Always** — non-negotiable policy |
| **2** | [tdd-strategy.md](tdd-strategy.md) | Pyramid, tools, directories, CI |
| **3** | [../api/contract.md](../api/contract.md) | API integration + E2E contract tests |
| **4** | Feature doc for the area under test | e.g. [../features/whatsapp-flow.md](../features/whatsapp-flow.md) |

If you skip step 1, the test is **invalid** for merge — regardless of coverage.

## Three test layers (all required over project lifetime)

| Layer | Purpose | Tool | Runs in CI |
|-------|---------|------|------------|
| **Unit** | Pure logic, VOs, link builders — fast, no I/O | Vitest | Yes |
| **Integration (contract)** | HTTP/DB behavior vs **documented contract** | Vitest + Supertest + test DB | Yes |
| **E2E** | Full user journeys in real browser | Playwright | Yes (Phase 7+) |

**Manual testing** validates what automation cannot (visual 3D, WhatsApp app handoff). It **supplements** — never replaces — automated contract and E2E tests.

## Quick commands

```bash
pnpm test                              # All packages (Turbo)
pnpm --filter @print3d/api test        # API unit + integration
pnpm --filter @print3d/whatsapp test # Package unit tests
pnpm e2e                               # Playwright E2E (root script, Phase 7+)
```

## Agent checklist (before writing tests)

- [ ] Read [contract-first-testing.md](contract-first-testing.md)
- [ ] Test asserts **documented behavior**, not implementation details
- [ ] Expected values come from **docs/** (contract, features), not from reading production code
- [ ] Test would **fail** if implementation drifts from contract without doc change
- [ ] No duplicated logic from the function under test inside the test body

## Related

- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.local/phases/` — per-phase test tasks
- `.cursor/rules/contract-first-testing.mdc` — Cursor always-on rule
