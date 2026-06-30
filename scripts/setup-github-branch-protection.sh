#!/usr/bin/env bash
# Configure GitHub branch protection — docs/operations/ci-cd.md
set -euo pipefail

REPO="${GITHUB_REPO:-AlexandreZanata/open-3d-store-free-to-use}"

if ! command -v gh >/dev/null 2>&1; then
  echo "install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

payload_main() {
  cat <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Quality gate", "E2E"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
}

payload_developing() {
  cat <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["Quality gate", "E2E"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
}

echo "==> Protecting main (require Quality gate + E2E before merge)"
payload_main | gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/main/protection" \
  --input -

echo "==> Protecting developing (CI must pass)"
if payload_developing | gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/branches/developing/protection" \
  --input - 2>/dev/null; then
  echo "developing protected"
else
  echo "developing protection skipped (branch may not exist yet)"
fi

echo "==> Done. Workflow:"
echo "  git checkout developing && git push origin developing"
echo "  Open PR developing → main; merge when CI green"
