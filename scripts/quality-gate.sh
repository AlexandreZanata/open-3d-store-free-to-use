#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-full}"

run_typecheck() {
  echo "==> Typecheck (tsc --noEmit)"
  pnpm turbo lint
}

run_eslint() {
  echo "==> ESLint (no any / unknown, strict type-checked)"
  pnpm exec eslint . --max-warnings 0
}

run_size() {
  echo "==> Size & complexity"
  if [[ -x ./scripts/verify-size-complexity.sh ]]; then
    ./scripts/verify-size-complexity.sh
  elif [[ -x ./agent-harness/verify-size-complexity.sh ]]; then
    ./agent-harness/verify-size-complexity.sh
  else
    echo "FAIL: verify-size-complexity.sh not found" >&2
    exit 1
  fi
}

run_infra_contract() {
  echo "==> Infra contract tests"
  node --test scripts/infra-contract.test.mjs
}

run_tests() {
  echo "==> Tests"
  pnpm turbo test
}

run_build() {
  echo "==> Build"
  pnpm turbo build
}

case "$MODE" in
  quick)
    run_typecheck
    run_eslint
    ;;
  full)
    run_typecheck
    run_eslint
    run_size
    run_tests
    ;;
  ci)
    run_typecheck
    run_eslint
    run_size
    run_infra_contract
    run_build
    run_tests
    ;;
  *)
    echo "Usage: $0 [quick|full|ci]" >&2
    exit 1
    ;;
esac

echo "==> Quality gate passed ($MODE)"
