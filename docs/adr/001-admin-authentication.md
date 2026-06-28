# ADR 001 — Admin Authentication

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-28 |
| **Phase** | 9 — Admin spec & types |

## Context

The storefront API is anonymous. The admin panel needs a **separate authenticated surface** with elevated privileges (catalog CRUD, file uploads, order inspection). OWASP BFLA requires function-level guards on every admin handler — not optional auth.

## Decision

### Mechanism: server-side session cookie

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Token format | Opaque server-side session ID in **httpOnly cookie** | XSS cannot read token; simpler revocation than JWT blocklists |
| Cookie name | `print3d_admin_session` | Namespaced; distinct from any future storefront session |
| Flags | `HttpOnly`, `Secure` (prod), `SameSite=Strict`, `Path=/api/v1/admin` | CSRF mitigation + scoped to admin API only |
| Storage | Redis session store (same Redis 8.8 instance) | Fast TTL expiry; survives PM2 cluster reload |
| Password hash | **argon2id** via `@node-rs/argon2` or `argon2` | Harness: vetted algorithm; never plaintext |
| Credentials table | `admin_users` (email unique, password_hash, role, last_login_at) | Single-tenant MVP |

**Rejected:** JWT in `Authorization` header for admin MVP — harder to revoke instantly; cookie session fits same-origin admin SPA on separate origin with CORS credentials.

### Session TTL

| Role | TTL | Notes |
|------|-----|-------|
| `admin` | **8 hours** sliding | Shorter than typical user sessions (harness: admin expires faster) |
| Idle timeout | 30 minutes | Extend sliding window on authenticated request |

Configure via `ADMIN_SESSION_TTL` (seconds, default `28800`) and `ADMIN_SESSION_IDLE_TTL` (seconds, default `1800`).

### Roles (MVP)

Single role: **`admin`**. No roles table in MVP.

| Role | Capabilities |
|------|--------------|
| `admin` | All `/api/v1/admin/*` endpoints |

Future multi-role: add `admin_roles` table — out of scope until ADR amendment.

### Bootstrap (development only)

`ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD` seed one admin user on first API start when `NODE_ENV=development` and table is empty. **Never set in production.**

### Security rules (non-negotiable)

1. Admin routes **MUST NOT** reuse public anonymous session or storefront cookies.
2. Every admin handler calls an **application-layer auth guard** before domain work (BFLA).
3. Login failures audited; passwords never logged (see ADR + `audit-logging.md`).
4. Login rate limit: **5 requests / IP / minute** (`POST /admin/auth/login`).
5. Mass-assignment blocked: clients cannot set `role`, `id`, `passwordHash`, `createdAt`, `lastLoginAt`.

## Consequences

- Phase 10 adds `admin_users` + `audit_logs` tables and session repository.
- Phase 12 adds Fastify session plugin + auth middleware on `/api/v1/admin/*`.
- Admin panel (Phase 13+) sends `credentials: 'include'` to `ADMIN_ORIGIN`-allowed API.

## Related

- [002-admin-api-namespace.md](002-admin-api-namespace.md)
- [../api/admin-contract.md](../api/admin-contract.md)
- `agent-rules/03-security/authentication.md`
- `agent-rules/03-security/authorization.md`
- `agent-rules/03-security/audit-logging.md`
