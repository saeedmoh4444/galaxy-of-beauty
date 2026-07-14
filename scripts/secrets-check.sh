#!/bin/bash
# Galaxy of Beauty — Secrets Leak Detection
# Scans the repo for hardcoded secrets before commits
set -euo pipefail

echo "=== Scanning for secrets ==="

PATTERNS=(
  "DATABASE_URL=postgresql://[^l]"  # Non-localhost DB URLs
  "JWT_ACCESS_SECRET=[A-Za-z0-9]\{32,\}" # JWT secrets in code
  "sk-[A-Za-z0-9]\{32,\}"           # OpenAI/Stripe keys
  "AKIA[A-Z0-9]\{16\}"              # AWS Access Keys
  "ghp_[A-Za-z0-9]\{36\}"           # GitHub PATs
)

FAILED=0
for pattern in "${PATTERNS[@]}"; do
  if grep -rn --exclude-dir={node_modules,.git,.turbo,dist,backups} \
       --exclude={*.lock,*.log,.env.example} "$pattern" . 2>/dev/null; then
    echo "❌ Found potential secret matching: $pattern"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo "❌ Secrets detected — please remove before committing"
  exit 1
else
  echo "✅ No secrets detected"
fi
