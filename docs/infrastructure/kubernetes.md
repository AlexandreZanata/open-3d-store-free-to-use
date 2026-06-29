# Kubernetes — not used on single VPS

> **Decision:** this project runs on **one Hostinger VPS (16 GB)**. Kubernetes is **rejected** for this scale — see [../stack/rejected-options.md](../stack/rejected-options.md) (microservices overhead).

## Why PM2 + Docker Compose wins here

| Approach | RAM overhead | Ops complexity | Fit for solo dev |
|----------|--------------|----------------|------------------|
| PM2 + native DB | Lowest | Low | **Best** |
| PM2 + Docker Compose data | Low (+~100 MB) | Medium | Good |
| k3s single-node | ~500 MB–1 GB control plane | High | Poor |
| Managed K8s (EKS/GKE) | N/A + cost | High | Out of budget |

Harness constraint: [../architecture/constraints.md](../architecture/constraints.md) — single VPS, budget-aware.

## What we use instead

| Concern | Solution |
|---------|----------|
| Process supervision | PM2 (`infra/pm2.ecosystem.config.js`) |
| DB / cache / queue | `infra/docker-compose.prod.yml` or native packages |
| Reverse proxy / TLS | Nginx + certbot |
| Deploy | `infra/scripts/deploy.sh` + GitHub Actions SSH |
| Edge CDN / DNS | Cloudflare ([cloudflare-dns.md](cloudflare-dns.md)) |

## When to reconsider Kubernetes

Re-evaluate only if **all** apply:

- Multiple application nodes or regions
- Dedicated DevOps capacity
- Load beyond one 16 GB machine (sustained)
- ADR approved in `docs/adr/`

Until then, scaling path:

1. Vertical — larger VPS
2. Split static `/models/` to object storage (requires ADR — R2 was rejected)
3. Read replica for Postgres (still single API node)

## Related

- [vps-provisioning.md](vps-provisioning.md)
- [deployment.md](deployment.md)
- [docker-compose.md](docker-compose.md)
