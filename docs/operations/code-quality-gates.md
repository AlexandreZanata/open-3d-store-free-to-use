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

## Quality Gate Protocol

**Size and complexity are base gates — paired with typecheck, not optional extras.**

```text
Before commit / PR / agent sign-off:
  1. Typecheck     pnpm turbo lint  (tsc --noEmit per package)
  2. Size          ≤200 lines/file, ≤80 lines/function on changed code
  3. Complexity    ≤10 cyclomatic per changed function
  4. Tests         pnpm turbo test
```

Passing typecheck **without** size/complexity verification is **not** acceptable.

---

## Commands (this repo)

| Gate | Command |
|------|---------|
| Typecheck | `pnpm turbo lint` |
| File size (automated) | `./agent-harness/verify-size-complexity.sh` |
| Unit + integration | `pnpm turbo test` |
| Full local gate | `pnpm turbo lint && ./agent-harness/verify-size-complexity.sh && pnpm turbo test` |

Function length and cyclomatic complexity: enforce via ESLint when configured; otherwise **manual count** on every changed function before sign-off.

**Scope note:** `./agent-harness/verify-size-complexity.sh` defaults to `apps/api` and `packages`. Use `--all` for full monorepo (may include legacy UI boilerplate pending refactor).

---

## CI alignment

GitHub Actions MUST run typecheck, tests, and size/complexity checks before merge. See [ci-cd.md](ci-cd.md).

When bootstrapping ESLint for a package, use harness-recommended rules from `agent-rules/00-core/size-and-complexity-limits.md`:

- `max-lines`: 200
- `max-lines-per-function`: 80
- `complexity`: 10

---

## Agent and reviewer checklist

- [ ] Typecheck passes on all touched packages
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
