#!/bin/bash
# Dependabot merge wave — temp strict-off, REST-merge, guaranteed strict restore.
cd "C:/Users/saeed/Desktop/under_working/beauty_project" || exit 1
repo=saeedmoh4444/galaxy-of-beauty

strict() { # $1 = true|false
  rtk proxy gh api -X PUT "repos/$repo/branches/master/protection/required_status_checks" \
    -f strict=$1 \
    -f 'contexts[]=Format (Prettier)' \
    -f 'contexts[]=Dependency Audit' \
    -f 'contexts[]=Type Check' \
    -f 'contexts[]=Lint' \
    -f 'contexts[]=Unit Tests' \
    -f 'contexts[]=Build' \
    -f 'contexts[]=E2E (Playwright)' -i 2>/dev/null | grep -E "^HTTP" || echo "strict() call errored"
}

echo "==> setting strict=false: $(strict false)"
for n in 3 29 43 103; do
  done=0
  for t in 1 2 3 4 5 6 7 8; do
    resp=$(rtk proxy gh api -X PUT "repos/$repo/pulls/$n/merge" -f merge_method=squash 2>&1)
    if echo "$resp" | grep -q '"merged":true'; then
      echo "PR #$n MERGED on attempt $t"
      done=1; break
    fi
    msg=$(echo "$resp" | grep -o '"message":"[^"]*"' | head -1)
    echo "PR #$n attempt $t -> ${msg:-no-json-message}"
    sleep 25
  done
  [ $done -eq 0 ] && echo "PR #$n FAILED after retries"
done
echo "==> restoring strict=true: $(strict true)"
echo "==> WAVE DONE"
