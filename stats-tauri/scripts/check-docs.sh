#!/usr/bin/env bash
set -euo pipefail

BASE_REF=${DOCS_BASE_REF:-origin/main}

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref $BASE_REF not found; skipping docs check." && exit 0
fi

changed_paths=$(git diff --name-only "$BASE_REF"...HEAD)

affected_code=$(echo "$changed_paths" | grep -E '^(stats-tauri/src|stats-tauri/src-tauri|src-tauri|src|Modules|Widgets|LaunchAtLogin|Stats|Tests)/' || true)

docs_touched=$(echo "$changed_paths" | grep -E '^docs/(status\.md|changelog\.md)' || true)

if [[ -n "$affected_code" && -z "$docs_touched" ]]; then
  echo "Docs check failed: code changed without updating docs/status.md or docs/changelog.md." >&2
  exit 1
fi

echo "Docs check passed or not applicable."
