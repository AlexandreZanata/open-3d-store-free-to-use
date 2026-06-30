# Enterprise Documentation Index

> **Authoritative specification** for the Open 3D Store (AXIS) platform — catalog, 3D preview, and WhatsApp order capture.
>
> **Execution tasks** live in `.local/phases/` (gitignored). This folder holds reference architecture only.

---

## How to use this documentation

| Audience | Start here |
|----------|------------|
| **Human developer** | [architecture/system-overview.md](architecture/system-overview.md) → [stack/technology-decisions.md](stack/technology-decisions.md) |
| **AI agent** | [../AGENTS.md](../AGENTS.md) → active phase in `.local/phases/` → docs referenced by that phase |
| **API consumer** | [api/contract.md](api/contract.md) |
| **Admin API** | [api/admin-contract.md](api/admin-contract.md) → [api/axis-print3d-store-api.md](api/axis-print3d-store-api.md) |
| **Admin panel** | [features/admin-panel.md](features/admin-panel.md) |
| **Catalog realtime (SSE)** | [features/catalog-realtime.md](features/catalog-realtime.md) |
| **DevOps** | [infrastructure/vps-provisioning.md](infrastructure/vps-provisioning.md) → [infrastructure/deployment.md](infrastructure/deployment.md) → [operations/ci-cd.md](operations/ci-cd.md) |

---

## Documentation map

### Architecture

| Document | Contents |
|----------|----------|
| [architecture/system-overview.md](architecture/system-overview.md) | Product vision, user journey, traffic model |
| [architecture/constraints.md](architecture/constraints.md) | Non-negotiables, hosting, budget |
| [architecture/domain-model.md](architecture/domain-model.md) | DDD aggregates, value objects, events |
| [architecture/backend-architecture.md](architecture/backend-architecture.md) | Layers, directories, use cases, schema |
| [architecture/monorepo-structure.md](architecture/monorepo-structure.md) | Target monorepo layout, pnpm, Turborepo |

### Stack & technology

| Document | Contents |
|----------|----------|
| [stack/technology-decisions.md](stack/technology-decisions.md) | Selected stack with rationale |
| [stack/rejected-options.md](stack/rejected-options.md) | Explicitly rejected alternatives |

### API & features

| Document | Contents |
|----------|----------|
| [api/contract.md](api/contract.md) | REST API v1 — public catalog, errors, caching |
| [api/admin-contract.md](api/admin-contract.md) | Admin REST API v1 — auth, CRUD, uploads |
| [api/axis-print3d-store-api.md](api/axis-print3d-store-api.md) | **AXIS Print3D Store API** — full route index (public + admin) |
| [api/swagger.md](api/swagger.md) | Swagger UI at `/docs` (development) |
| [adr/001-admin-authentication.md](adr/001-admin-authentication.md) | Session cookie auth decision |
| [adr/002-admin-api-namespace.md](adr/002-admin-api-namespace.md) | `/admin` prefix, CORS, Swagger |
| [features/3d-viewer.md](features/3d-viewer.md) | `@google/model-viewer` integration |
| [features/whatsapp-flow.md](features/whatsapp-flow.md) | Order capture and deep-link generation |
| [features/cep-lookup.md](features/cep-lookup.md) | CEP validate + IBGE offline lookup |
| [features/i18n.md](features/i18n.md) | Bilingual UI/API (`en` + `pt-BR`) |
| [features/store-user-accounts.md](features/store-user-accounts.md) | Shopper accounts — cart & favorites persistence |
| [features/responsive-layout.md](features/responsive-layout.md) | Mobile-first UI + desktop (`lg+`) layout |
| [features/product-share.md](features/product-share.md) | Product page Web Share + desktop fallbacks |
| [features/admin-panel.md](features/admin-panel.md) | Admin SPA — routes, design, dev & E2E |

### Infrastructure & operations

| Document | Contents |
|----------|----------|
| [infrastructure/deployment.md](infrastructure/deployment.md) | VPS layout, PM2, deploy script |
| [infrastructure/vps-provisioning.md](infrastructure/vps-provisioning.md) | **End-to-end VPS + Cloudflare setup** |
| [infrastructure/cloudflare-dns.md](infrastructure/cloudflare-dns.md) | Cloudflare + Registro.br DNS |
| [infrastructure/shared-vps-multi-domain.md](infrastructure/shared-vps-multi-domain.md) | **corvo3d.com.br** on shared VPS |
| [infrastructure/kubernetes.md](infrastructure/kubernetes.md) | Why K8s is not used on single VPS |
| [infrastructure/nginx.md](infrastructure/nginx.md) | Reverse proxy, static files, SSL |
| [infrastructure/docker-compose.md](infrastructure/docker-compose.md) | Local Postgres 18.4 + Redis 8.8 |
| [infrastructure/environment.md](infrastructure/environment.md) | Env vars, Zod validation |

### Quality & delivery

| Document | Contents |
|----------|----------|
| [testing/tdd-strategy.md](testing/tdd-strategy.md) | Pyramid, Vitest, Playwright, coverage gates |
| [testing/README.md](testing/README.md) | **Read before any test** — mandatory order |
| [testing/contract-first-testing.md](testing/contract-first-testing.md) | Restrictive contract-first test policy |
| [operations/performance-caching.md](operations/performance-caching.md) | Redis TTLs, DB tuning, rate limits |
| [operations/ci-cd.md](operations/ci-cd.md) | GitHub Actions workflow |
| [operations/code-quality-gates.md](operations/code-quality-gates.md) | **Size/complexity caps** — mandatory with typecheck |
| [operations/commands-reference.md](operations/commands-reference.md) | Dev, test, build, prod commands |

### Governance

| Document | Contents |
|----------|----------|
| [governance/commit-conventions.md](governance/commit-conventions.md) | Commit message rules, scope, workflow |
| [GLOSSARY.md](GLOSSARY.md) | Ubiquitous language |
| [NEW-PROJECT-CHECKLIST.md](NEW-PROJECT-CHECKLIST.md) | Pre-implementation checklist |

---

## Current vs target state

| Area | Current (this repo) | Target (spec) |
|------|---------------------|---------------|
| Frontend | `apps/web/` — TanStack Start + React 19 | Same (Phase 0 complete) |
| Backend | `@print3d/api` — public catalog API complete | Admin handlers Phase 10–12 |
| Packages | `@print3d/shared-types` incl. admin DTOs (Phase 9) | Used by API and web |
| Infra | `infra/` — Nginx, PM2, deploy/migrate scripts, CI deploy | Docker dev compose |
| i18n | Spec in `docs/features/i18n.md` | Full `en` + `pt-BR` — Phases 1–7 |

Phase 0 complete — monorepo scaffold with pnpm workspaces and Turborepo.

---

## Harness rules (always apply)

Resolve before non-trivial work:

```bash
./agent-harness/resolve-rules.sh domain layer api auth owasp tdd
```

| Topic | Harness path |
|-------|--------------|
| Architecture | `agent-rules/AGENT-CORE-PRINCIPLES.md` |
| Size / complexity | `agent-rules/00-core/size-and-complexity-limits.md` — **always with typecheck** |
| API design | `agent-rules/10-api-design/contract-first.md` |
| Security | `agent-rules/03-security/README.md` |
| Testing | `agent-rules/04-testing/tdd.md` |
| Migrations | `agent-rules/07-data-management/migrations.md` |

When docs conflict with harness rules, **harness rules prevail** unless explicitly overridden for a task.
