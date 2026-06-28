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
| **Language** | 100% English in code, docs, commits (harness `english-only.mdc`) |
| **No `.glb` in git** | Model files uploaded to server; DB stores URL paths only |

## Harness alignment

| Constraint area | Rule file |
|-----------------|-----------|
| Security | `agent-rules/03-security/README.md` |
| Size limits | `agent-rules/00-core/size-and-complexity-limits.md` |
| Minimal scope | `.cursor/rules/ponytail.mdc` |

## Related documents

- [system-overview.md](system-overview.md)
- [../infrastructure/deployment.md](../infrastructure/deployment.md)
- [../stack/rejected-options.md](../stack/rejected-options.md)
