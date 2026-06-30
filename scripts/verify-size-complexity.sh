#!/usr/bin/env bash
# verify-size-complexity.sh — enforce universal file line cap (200 lines).
# Canonical copy lives in agent-harness/; this script keeps CI working without submodule init.
set -euo pipefail

MAX_FILE_LINES=200

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXTENSIONS=("ts" "tsx" "js" "jsx" "mjs" "cjs" "py" "go" "rs" "java" "kt" "sql" "sh")

usage() {
  cat <<EOF
Usage: $(basename "$0") [paths...]

Verify no source file exceeds ${MAX_FILE_LINES} lines.
If no paths given, scans: apps/api, packages (excludes node_modules, dist, .turbo).
Use --all to include apps/web and other apps.
EOF
}

find_source_files() {
  local -a find_args=()
  for ext in "${EXTENSIONS[@]}"; do
    find_args+=(-name "*.${ext}" -o)
  done
  unset 'find_args[${#find_args[@]}-1]'

  if [[ $# -gt 0 ]]; then
    find "$@" \( "${find_args[@]}" \) \
      ! -path "*/node_modules/*" \
      ! -path "*/dist/*" \
      ! -path "*/.turbo/*" \
      ! -path "*/.git/*" 2>/dev/null
  else
    find apps packages \( "${find_args[@]}" \) \
      ! -path "*/node_modules/*" \
      ! -path "*/dist/*" \
      ! -path "*/.turbo/*" 2>/dev/null
  fi
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

scan_paths=()
if [[ $# -eq 0 ]]; then
  scan_paths=(apps/api packages)
elif [[ "${1:-}" == "--all" ]]; then
  shift
  scan_paths=(apps packages)
else
  scan_paths=("$@")
fi

failures=0
checked=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  lines=$(wc -l < "$file" | tr -d ' ')
  checked=$((checked + 1))
  if [[ "$lines" -gt "$MAX_FILE_LINES" ]]; then
    echo "FAIL: ${file} — ${lines} lines (max ${MAX_FILE_LINES})"
    failures=$((failures + 1))
  fi
done < <(find_source_files "${scan_paths[@]}")

if [[ "$failures" -gt 0 ]]; then
  echo ""
  echo "${failures} file(s) exceed ${MAX_FILE_LINES} lines. Split by responsibility before commit."
  exit 1
fi

echo "OK: ${checked} file(s) within ${MAX_FILE_LINES}-line cap."
