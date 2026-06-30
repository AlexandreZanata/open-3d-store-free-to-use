#!/usr/bin/env bash
# Configure GitHub branch protection — docs/operations/ci-cd.md
set -euo pipefail

REPO="${GITHUB_REPO:-AlexandreZanata/open-3d-store-free-to-use}"

if ! command -v gh >/dev/null 2>&1; then
  echo "install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

echo "==> Protecting main (require Quality gate + E2E, PR only)"
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/main/protection" \
  -f required_status_checks[strict]=true \
  -F 'required_status_checks[contexts][]=Quality gate' \
  -F 'required_status_checks[contexts][]=E2E' \
  -f enforce_admins=false \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false

echo "==> Optional: protect developing (CI must pass before push — use PR to main)"
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/developing/protection" \
  -f required_status_checks[strict]=false \
  -F 'required_status_checks[contexts][]=Quality gate' \
  -F 'required_status_checks[contexts][]=E2E' \
  -f enforce_admins=false \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  2>/dev/null || echo "developing branch not on remote yet — re-run after first push"

echo "==> Done. Workflow:"
echo "  git checkout developing && git push -u origin developing"
echo "  Open PR developing → main; merge when CI green"
