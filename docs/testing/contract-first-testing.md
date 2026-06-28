# Contract-First Testing Policy

> **Restrictive and mandatory.** Applies to all contributors and AI agents.  
> **Read completely before creating or modifying any test.**

Harness alignment: `agent-rules/04-testing/tdd.md`, `agent-rules/10-api-design/contract-first.md`

---

## Core principle

**Tests are executable specifications — not mirrors of the code.**

A test encodes what the system **MUST** do according to documentation (`docs/api/contract.md`, `docs/features/*`, `docs/architecture/domain-model.md`). If production code changes but the documented contract does not, **the test MUST fail**.

---

## Non-negotiable rules

### 1. Contract tests are immutable specifications

| Allowed change trigger | Forbidden change trigger |
|------------------------|--------------------------|
| Update to `docs/api/contract.md` or feature spec | "Implementation changed, let's fix the test" |
| ADR approved in `docs/adr/` | Copying new return shape from source code |
| Explicit user request with doc update | Making test pass by weakening assertions |

**Contract test files** (HTTP integration, E2E against documented journeys) are written from **docs only**. Treat them like an API schema: change the doc first, then the test, then the code.

### 2. NEVER mirror implementation in tests

**Forbidden:**

```typescript
// BAD — test re-implements production logic
const expected = input.replace(/-/g, "").slice(0, 8).toUpperCase();
expect(formatOrderDisplayId(input)).toBe(expected);

// BAD — assertion copied from function return without spec reference
expect(result).toEqual(await serviceUnderTest.buildResponse(payload));
```

**Required:**

```typescript
// GOOD — expected value from docs/features/whatsapp-flow.md example
expect(message).toContain("*Total estimado: R$ 90,00*");

// GOOD — HTTP contract from docs/api/contract.md
expect(response.statusCode).toBe(201);
expect(body.data).toMatchObject({
  orderId: expect.any(String),
  whatsappLink: expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/),
  totalPrice: "R$ 90,00",
});
```

If the only way to know the expected value is to read the implementation, **stop** — define it in docs first.

### 3. Every test must represent a failure mode

Each test case MUST answer: *"What bug or contract violation does this catch?"*

| Test type | Must fail when… |
|-----------|-----------------|
| Unit (VO, formatter) | Invalid input accepted, wrong format, business rule broken |
| Integration (route) | Wrong status code, wrong JSON shape, missing header, wrong locale |
| E2E | User cannot complete journey, wrong language, broken redirect |
| Contract snapshot | Response drifts from documented schema without doc update |

**Forbidden:** tests that only assert `expect(fn()).toBeDefined()` or `expect(true).toBe(true)`.

### 4. Three layers — distinct jobs

| Layer | Scope | Mocks | Contract source |
|-------|-------|-------|-----------------|
| **Unit** | Single module, pure functions, VOs | All I/O mocked | Domain model + feature docs |
| **Integration** | API routes, repositories + real test DB | External services only | `docs/api/contract.md` |
| **E2E** | Browser, full stack or stubbed API | None for UI; real HTTP | System overview + feature journeys |

Do not collapse layers (e.g. E2E asserting internal DB state).

### 5. Automated tests run in CI — always

| Gate | Command |
|------|---------|
| All unit + integration | `pnpm turbo test` |
| E2E (Phase 7+) | `pnpm e2e` |
| Lint | `pnpm turbo lint` |

No PR merges with failing automated tests. Manual QA is **additional**, not a substitute.

### 6. Manual testing — when required

Use manual verification for:

- 3D model rendering quality (WebGL)
- WhatsApp app opening on device
- Visual/i18n layout in both locales

Document manual steps in phase done-conditions. **Also** automate everything that can be asserted (HTTP status, redirect URL pattern, locale headers).

---

## Writing workflow (agents and devs)

```
1. READ docs/testing/README.md + this file
2. READ the contract/feature doc for the behavior
3. WRITE failing test with expected values FROM DOCS
4. RUN test — confirm RED (failure must be meaningful)
5. IMPLEMENT minimum code
6. RUN test — confirm GREEN
7. REFACTOR code only — do NOT weaken test assertions
```

### Red test quality

A new test that passes before implementation is **suspicious** — either the feature exists or the test mirrors code. Verify RED first.

---

## Anti-patterns (reject in review)

| Anti-pattern | Why forbidden |
|--------------|---------------|
| `expect(fn(x)).toBe(fn(x))` round-trip | Proves nothing |
| Snapshot of entire implementation output without spec | Breaks on any refactor |
| Test imports private helpers to build expectations | Couples test to internals |
| Adjusting expected URL because "code uses port 5173" without doc update | Contract drift |
| Skipping assertions on error paths | Misses contract violations |
| `@ts-ignore` or `as any` to silence test type errors | Hides contract mismatch |

---

## File naming conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Unit | `*.test.ts` | `Price.test.ts` |
| Integration | `*.integration.test.ts` or `tests/integration/**` | `products.routes.test.ts` |
| Contract | `*.contract.test.ts` (optional suffix) | `GET-products.contract.test.ts` |
| E2E | `*.spec.ts` in `e2e/` | `order-via-whatsapp.spec.ts` |

---

## E2E specifics (Playwright)

**Directory:** `e2e/` (repo root) or `apps/web/e2e/` — see [tdd-strategy.md](tdd-strategy.md).

- Assert **user-visible outcomes**: URL, visible text (i18n keys resolved), HTTP responses via `page.request` when needed
- Use **documented** selectors and copy from feature specs — not arbitrary `data-testid` unless documented
- Run headless in CI; headed locally for debug
- Minimum E2E suites: health/catalog browse, product detail, order → WhatsApp redirect, language switch EN ↔ PT

---

## When a test fails after refactor

1. Is the **documented contract** still correct? → Fix code.
2. Did the **contract intentionally change**? → Update doc → update test → update code (in that order).
3. Never "fix" a failing contract test by aligning it to code without a doc change.

---

## Related documents

- [README.md](README.md) — entry point
- [tdd-strategy.md](tdd-strategy.md) — pyramid, CI, phase matrix
- [../api/contract.md](../api/contract.md)
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.local/phases/` — phase-specific test tasks
