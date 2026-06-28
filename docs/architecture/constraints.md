# Constraints & Non-Negotiables

> Agents MUST NOT violate these constraints. When a request conflicts, ask before proceeding.

| Constraint | Details |
|------------|---------|
| **Hosting** | Single VPS — Hostinger, 16 GB RAM |
| **No payment gateway** | All transactions handled via WhatsApp |
| **Frontend exists** | React (TanStack Start). Backend exposes clean REST API |
| **3D visualization** | Must render `.glb` / `.gltf` files in-browser |
| **Solo maintainer** | Architecture operable by one developer |
| **Budget-aware** | Minimize paid services; prefer self-hosted OSS |
| **Language (developer)** | English in code identifiers, repo docs, commits, logs (harness `english-only.mdc`) |
| **Language (product)** | **100% i18n** — user-facing UI and API messages in **`en`** and **`pt-BR` only** ([features/i18n.md](../features/i18n.md)) |
| **No `.glb` in git** | Model files uploaded to server; DB stores URL paths only |
| **Testing** | Contract-first — tests from **docs**, never mirrored from code ([testing/contract-first-testing.md](../testing/contract-first-testing.md)) |

## Harness alignment

| Constraint area | Rule file |
|-----------------|-----------|
| Security | `agent-rules/03-security/README.md` |
| Size limits | `agent-rules/00-core/size-and-complexity-limits.md` |
| Minimal scope | `.cursor/rules/ponytail.mdc` |
| i18n (user-facing) | [../features/i18n.md](../features/i18n.md) |
| Testing | [../testing/contract-first-testing.md](../testing/contract-first-testing.md) |

## Related documents

- [../features/i18n.md](../features/i18n.md)
- [system-overview.md](system-overview.md)
- [../infrastructure/deployment.md](../infrastructure/deployment.md)
- [../stack/rejected-options.md](../stack/rejected-options.md)
