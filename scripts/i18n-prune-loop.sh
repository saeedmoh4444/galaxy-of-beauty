#!/usr/bin/env bash
# Iterative dead-key prune with a type-check feedback loop.
# Each round: prune (honoring the keep-file) -> type-check all packages ->
# collect keys the type-checker proves are still used -> restore + keep them.
set -u
cd "$(dirname "$0")/.." || exit 1
KEEP=./.i18n-keep.tmp
: > "$KEEP"

for round in $(seq 1 8); do
  echo "=== round $round ==="
  git checkout -- packages/shared/src/i18n/messages/ 2>/dev/null
  node scripts/prune-dead-i18n.mjs --write --keep-file "$KEEP"

  errors=$( { pnpm --filter @galaxy/shared type-check 2>&1;
              pnpm --filter @galaxy/web type-check 2>&1;
              pnpm --filter @galaxy/mobile type-check 2>&1;
              pnpm --filter @galaxy/api type-check 2>&1;
              pnpm --filter @galaxy/ui type-check 2>&1; } \
    | grep -oE "Type '\"[a-zA-Z0-9._-]+\"' is not assignable" \
    | sed -E "s/Type '\"([a-zA-Z0-9._-]+)\"' is not assignable/\1/" \
    | sort -u )

  if [ -z "$errors" ]; then
    echo "CLEAN after round $round"
    exit 0
  fi
  echo "$errors" >> "$KEEP"
  echo "kept $(echo "$errors" | wc -l) keys"
done
echo "still dirty after 8 rounds"
exit 1
