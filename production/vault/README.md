# Production secrets vault (local only)

Encrypted at-rest copies of VPS deploy files. **Never commit plaintext** `vps.env`, `*.env`, or SSH private keys.

## Threat model

| Layer | Mechanism |
|-------|-----------|
| **Git** | Plaintext secrets are gitignored; only `*.example` and this README are public |
| **Local vault** | [age](https://github.com/FiloSottile/age) (AES-256-GCM + scrypt passphrase or X25519 identity) |
| **CI deploy** | GitHub Encrypted Secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`) — never in the repo |
| **PQ posture** | Symmetric age is not post-quantum; for PQ SSH use OpenSSH 9.8+ hybrid KEX on the VPS. Rotate credentials if plaintext ever reached a public remote |

If secrets were exposed on GitHub: **rotate** DB passwords, `ADMIN_SESSION_SECRET`, SSH keys, and API tokens before re-encrypting.

## Setup (once per machine)

```bash
sudo apt install age   # or: brew install age
./scripts/production-vault.sh init
```

`init` creates `production/vault/identity.txt` (chmod 600). **Back up offline** — loss = cannot decrypt vault.

## Daily workflow

```bash
# After editing production/vps.env or production/env/*.env
./scripts/production-vault.sh encrypt

# Before ./production/deploy-to-vps.sh
./scripts/production-vault.sh decrypt

./production/deploy-to-vps.sh
```

Encrypted blobs live in `production/vault/encrypted/` (gitignored).

## CI auto-deploy (main only)

1. Repo → **Settings → Secrets and variables → Actions**
2. Add `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (private key PEM, no passphrase)
3. Push to `developing` → open PR to `main` → merge when CI is green → deploy runs on VPS

Deploy is skipped (green notice) until secrets exist — CI does not fail.

## Leak check before push

```bash
./scripts/verify-no-production-secrets.sh
```
