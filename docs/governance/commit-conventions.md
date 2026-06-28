# Commit Conventions

> Mandatory for all contributors and AI agents. 100% English in commit messages.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behavior |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `test` | Add or update tests only |
| `docs` | Documentation only |
| `chore` | Tooling, deps, CI, no production code |
| `build` | Build system, Turborepo, bundler config |
| `perf` | Performance improvement |
| `ci` | CI/CD workflow changes |

### Scope

Use monorepo package or area:

| Scope | Area |
|-------|------|
| `web` | `apps/web` frontend |
| `api` | `apps/api` backend |
| `shared-types` | `packages/shared-types` |
| `whatsapp` | `packages/whatsapp` |
| `infra` | `infra/`, Docker, Nginx, PM2 |
| `docs` | `docs/` |
| `harness` | Agent harness, `.cursor/rules` |
| `repo` | Root config (turbo, pnpm, tsconfig) |

Omit scope only for repo-wide changes: `chore: initialize pnpm workspace`

### Subject rules

- Imperative mood: "add", not "added" or "adds"
- Max 72 characters
- No trailing period
- Lowercase after type/scope (except proper nouns: AXIS, WhatsApp)

### Body (when needed)

- Explain **why**, not what (the diff shows what)
- Wrap at 72 characters
- Reference phase/task: `Phase 2 / Task 2.6 — apply Drizzle migrations`

### Footer

```
Refs: .local/phases/02-database-setup.md
Closes #123
BREAKING CHANGE: API response shape for GET /products changed
```

## Examples

```
feat(api): add GET /products with pagination and filters

Implements ListProducts use case with Redis cache (120s TTL).
Refs: docs/api/contract.md, .local/phases/06-http-layer.md
```

```
test(whatsapp): add link builder encoding tests

Covers URL encoding and BRL total formatting.
Refs: docs/testing/tdd-strategy.md, .local/phases/01-shared-packages.md
```

```
docs: add enterprise documentation index

Split monolithic spec into docs/ tree. Phases in .local/.
```

## Commit workflow

### Before every commit

1. Active phase task done-condition met
2. Tests pass for affected packages: `pnpm test` or scoped filter
3. Lint passes: `pnpm turbo lint`
4. No secrets in diff (`.env`, keys, tokens)
5. No `.glb` binaries in diff
6. `.local/` must NOT appear in staged files

### Atomic commits

- One logical unit per commit — one use case, one route, one package scaffold
- Do NOT mix `feat(api)` and `feat(web)` in same commit unless tightly coupled
- Do NOT commit broken main — each commit should build

### Phase boundaries

Prefer a commit (or PR) at each phase completion:

```
chore(repo): complete phase 0 monorepo scaffold

Refs: .local/phases/00-repository-scaffold.md
```

### AI agent rules

- NEVER commit unless user explicitly requests
- NEVER `--no-verify` unless user requests
- NEVER force-push to `main`
- Use HEREDOC for commit messages (multi-line body)
- Reference documentation paths in body, not long paraphrase

## Branch naming

```
phase/00-monorepo-scaffold
feat/api-product-routes
fix/whatsapp-encoding
docs/enterprise-spec
```

## Pull request title

Same format as commit subject: `feat(api): add order capture endpoint`

PR body must include:

- Phase reference (if applicable)
- Test plan checklist
- Links to `docs/` sections affected

## Related

- [../INDEX.md](../INDEX.md)
- `agent-rules/00-core/change-discipline.md`
- `.local/phases/` — done-conditions before commit
- Root `AGENTS.md`
