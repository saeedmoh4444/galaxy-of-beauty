#!/bin/bash
# Merge the four dependabot PRs now (strict is off). Restore strict=true no matter what.
cd "C:/Users/saeed/Desktop/under_working/beauty_project" || exit 1
tok=$(gh auth token)
repo=saeedmoh4444/galaxy-of-beauty
api="https://api.github.com/repos/$repo"

echo "==> strict now: $(curl -s "$api/branches/master/protection" -H "Authorization: token $tok" | grep -o '"strict":[a-z]*')"

for n in 3 29 43 103; do
  ok=0
  for t in 1 2 3 4 5 6; do
    body=$(curl -s -w "\n%{http_code}" -X PUT "$api/pulls/$n/merge" \
      -H "Authorization: token $tok" -H "Accept: application/vnd.github+json" \
      -d '{"merge_method":"squash"}')
    code=$(echo "$body" | tail -1)
    if echo "$body" | grep -q '"merged":true'; then
      echo "PR #$n MERGED (attempt $t, HTTP $code)"
      ok=1; break
    fi
    msg=$(echo "$body" | grep -o '"message":"[^"]*"' | head -1)
    echo "PR #$n attempt $t -> HTTP $code ${msg:-}"
    sleep 10
  done
  [ $ok -eq 0 ] && echo "PR #$n FAILED AFTER RETRIES"
done

echo "==> restoring strict=true:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X PUT "$api/branches/master/protection" \
  -H "Authorization: token $tok" -H "Accept: application/vnd.github+json" \
  --data-binary @.sweep-tmp/protection-strict-true.json
echo "==> strict now: $(curl -s "$api/branches/master/protection" -H "Authorization: token $tok" | grep -o '"strict":[a-z]*')"
echo "==> WAVE DONE"
