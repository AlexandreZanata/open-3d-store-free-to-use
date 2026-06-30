# Open 3D Store (AXIS)

Product catalog and order-capture platform for a 3D printing shop — browse models, preview in 3D, order via WhatsApp.

---

## Live production site — corvo3d.com.br

| | URL |
|---|-----|
| **Storefront** | **https://corvo3d.com.br** |
| **Admin panel** | **https://admin.corvo3d.com.br** |
| **API** | `https://corvo3d.com.br/api/v1` |

This VPS also hosts **another site on a different domain**. Print3d uses its own Nginx vhost and port **3101** — the other site is not modified.

**Deploy commands (local machine only — secrets never go to GitHub):**

```bash
cp production/vps.env.domain.example production/vps.env
# REQUIRED: edit production/vps.env — VPS_HOST=YOUR_VPS_IP, DOMAIN=corvo3d.com.br, VPS_USE_HTTPS=1

./production/deploy-to-vps.sh --env-only
./production/deploy-to-vps.sh

# SSH — SSL if certbot not run yet:
ssh -i production/ssh/id_ed25519_print3d root@YOUR_VPS_IP
cd /var/www/print3d
./infra/scripts/complete-print3d-domain-ssl.sh
```

If **corvo3d.com.br** shows another site, see [domain-go-live-corvo3d.md](docs/infrastructure/domain-go-live-corvo3d.md#common-errors).

Full checklist (multi-site VPS, Cloudflare, manual QA): [docs/infrastructure/domain-go-live-corvo3d.md](docs/infrastructure/domain-go-live-corvo3d.md)

---

## Quick start

```bash
pnpm install
pnpm --filter @print3d/web dev
```

Open [http://localhost:5173](http://localhost:5173).

## Documentation

| Resource | Path |
|----------|------|
| **Documentation index** | [docs/INDEX.md](docs/INDEX.md) |
| **System overview** | [docs/architecture/system-overview.md](docs/architecture/system-overview.md) |
| **Stack & technology** | [docs/stack/technology-decisions.md](docs/stack/technology-decisions.md) |
| **API contract v1** | [docs/api/contract.md](docs/api/contract.md) |
| **Domain model** | [docs/architecture/domain-model.md](docs/architecture/domain-model.md) |
| **i18n (en + pt-BR)** | [docs/features/i18n.md](docs/features/i18n.md) |
| **Storefront accounts** | [docs/features/store-user-accounts.md](docs/features/store-user-accounts.md) |
| **Testing policy** | [docs/testing/contract-first-testing.md](docs/testing/contract-first-testing.md) |
| **Commit conventions** | [docs/governance/commit-conventions.md](docs/governance/commit-conventions.md) |
| **Glossary** | [docs/GLOSSARY.md](docs/GLOSSARY.md) |

## Execution plan (local, not in git)

Implementation phases with task-level references live in **`.local/phases/`**:

```
.local/phases/00-repository-scaffold.md  → … → 08-production-deployment.md
```

See [.local/README.md](.local/README.md) for workflow.

## Agent harness

Read [AGENTS.md](AGENTS.md) at session start.

```bash
./agent-harness/resolve-rules.sh api domain tdd owasp
./agent-harness/generate-task-rules.sh api auth   # optional Cursor task rule
```

## Target architecture

| Layer | Technology |
|-------|------------|
| Frontend | TanStack Start, React 19, Tailwind 4 |
| Backend | Node 22, Fastify, Drizzle, PostgreSQL 18.4 |
| Cache | Redis 8.8 |
| 3D | `@google/model-viewer` |
| Orders | WhatsApp deep links (no payment gateway) |
| Monorepo | pnpm + Turborepo |

Full rationale: [docs/stack/technology-decisions.md](docs/stack/technology-decisions.md)

## Project layout

```
apps/web/              # @print3d/web — TanStack Start + i18next (en, pt-BR)
apps/api/              # @print3d/api — Drizzle schema + migrations
packages/shared-types/ # @print3d/shared-types — domain DTOs
packages/whatsapp/     # @print3d/whatsapp — wa.me link builder (+ telefone)
packages/cep/          # @print3d/cep — CEP validate + IBGE lookup
infra/                 # Docker, Nginx, PM2, deploy scripts
docs/                  # Enterprise documentation (in git)
.local/phases/         # Execution tasks (gitignored)
agent-rules/           # Harness rules
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | All apps via Turborepo (watch) |
| `pnpm --filter @print3d/web dev` | Frontend dev server only |
| `pnpm build` | Production build (all packages) |
| `pnpm test` | Tests via Turborepo |
| `pnpm lint` | ESLint via Turborepo |
| `pnpm format` | Prettier (web package) |

## Production deploy

**Domain:** **corvo3d.com.br** — see [shared-vps-multi-domain.md](docs/infrastructure/shared-vps-multi-domain.md).

Also: [vps-provisioning.md](docs/infrastructure/vps-provisioning.md) and [production/README.md](production/README.md) (local secrets).

## License

MIT — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
