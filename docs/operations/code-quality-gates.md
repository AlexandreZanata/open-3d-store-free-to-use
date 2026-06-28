# Code Quality Gates

> **Mandatory for every change.** Applies to all languages in this monorepo.
> Canonical harness rule: `agent-rules/00-core/size-and-complexity-limits.md`
> Cursor: `.cursor/rules/size-and-complexity-limits.mdc` (`alwaysApply: true`)

## Hard caps (never exceed)

| Metric | Cap | Scope |
|--------|-----|-------|
| Function / method | **80 lines** | Body of each function or method |
| File / module | **200 lines** | Total lines (imports + exports included) |
| Cyclomatic complexity | **≤ 10** | Per function — every branch, loop, `catch`, `&&`, `\|\|`, `?:` |

These limits are **language-agnostic**. TypeScript, SQL migrations, shell scripts, and Python (if added) follow the same caps.

---

## Type safety (no `any` / `unknown`)

Production TypeScript is enforced by **ESLint** (`eslint.config.mjs` at repo root):

| Rule | Effect |
|------|--------|
| `@typescript-eslint/no-explicit-any` | Blocks explicit `any` |
| `@typescript-eslint/no-restricted-types` | Blocks explicit `unknown` |
| `@typescript-eslint/no-unsafe-*` | Blocks unsafe use of untyped values |

**Excluded from ESLint strict rules:** generated files (`*.gen.ts`, `routeTree.gen.ts`), shadcn UI boilerplate (`apps/web/src/components/ui/**`), and test/script files (tests still typecheck via `tsc` where configured).

Use `JsonValue` from `@print3d/shared-types` for JSON request bodies instead of `unknown`.

---

## Quality Gate Protocol

**Size and complexity are base gates — paired with typecheck and ESLint, not optional extras.**

```text
Before commit / PR / agent sign-off:
  1. Typecheck     pnpm typecheck  (tsc --noEmit per package)
  2. ESLint        pnpm lint:eslint (no any / unknown in production code)
  3. Size          ≤200 lines/file, ≤80 lines/function on changed code
  4. Tests         pnpm turbo test
```

Passing typecheck **without** ESLint and size/complexity verification is **not** acceptable.

---

## Git hooks (automatic)

[Husky](https://typicode.github.io/husky/) runs gates locally:

| Hook | Command | Scope |
|------|---------|-------|
| **pre-commit** | `lint-staged` + `pnpm quality:quick` | ESLint on staged `.ts/.tsx` + full typecheck + ESLint |
| **pre-push** | `pnpm quality` | Typecheck, ESLint, size/complexity, tests |

To bypass hooks in an emergency (not recommended): `git commit --no-verify` / `git push --no-verify`.

Install hooks after clone: `pnpm install` (runs `prepare` → `husky`).

---

## Commands (this repo)

| Gate | Command |
|------|---------|
| Typecheck | `pnpm typecheck` or `pnpm turbo lint` |
| ESLint (strict types) | `pnpm lint:eslint` |
| Full lint | `pnpm lint` (= typecheck + ESLint) |
| File size (automated) | `./agent-harness/verify-size-complexity.sh` |
| Unit + integration | `pnpm turbo test` |
| **Full local gate** | `pnpm quality` or `./scripts/quality-gate.sh full` |
| **CI gate** | `./scripts/quality-gate.sh ci` (adds build) |

Function length and cyclomatic complexity: enforce via ESLint when configured; otherwise **manual count** on every changed function before sign-off.

**Scope note:** `./agent-harness/verify-size-complexity.sh` defaults to `apps/api` and `packages`. Use `--all` for full monorepo (may include legacy UI boilerplate pending refactor).

---

## CI alignment

GitHub Actions (`.github/workflows/ci.yml`) runs `./scripts/quality-gate.sh ci` on push/PR to `main`/`develop`. See [ci-cd.md](ci-cd.md).

When bootstrapping ESLint for a package, use harness-recommended rules from `agent-rules/00-core/size-and-complexity-limits.md`:

- `max-lines`: 200
- `max-lines-per-function`: 80
- `complexity`: 10

---

## Agent and reviewer checklist

- [ ] Typecheck passes on all touched packages
- [ ] ESLint passes (`pnpm lint:eslint`) — no `any` / `unknown` in production code
- [ ] No changed file exceeds 200 lines
- [ ] No changed function exceeds 80 lines
- [ ] No changed function exceeds cyclomatic complexity 10
- [ ] Tests pass
- [ ] No waiver without explicit user approval

---

## Related documents

- [../architecture/constraints.md](../architecture/constraints.md)
- [ci-cd.md](ci-cd.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
- [../../AGENTS.md](../../AGENTS.md)
- `agent-rules/00-core/size-and-complexity-limits.md`
