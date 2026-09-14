#!/bin/bash
# Dependabot merge cascade v2 — drive by mergeStateStatus instead of error text.
# BEHIND → refresh branch (merge master + push). CLEAN + checks green → merge.
cd "C:/Users/saeed/Desktop/under_working/beauty_project" || exit 1
PRS="29 103 43 3 1"
while true; do
  all_done=true
  for n in $PRS; do
    state=$(gh pr view "$n" --json state -q .state 2>/dev/null)
    [ "$state" = "OPEN" ] || continue
    all_done=false
    mss=$(gh pr view "$n" --json mergeStateStatus -q .mergeStateStatus 2>/dev/null)
    if [ "$mss" = "BEHIND" ] || [ "$mss" = "UNKNOWN" ]; then
      echo "#$n $mss → refresh"
      if gh pr checkout "$n" --force >/dev/null 2>&1; then
        if git merge origin/master --no-edit >/dev/null 2>&1 && git push >/dev/null 2>&1; then
          echo "#$n refreshed"
        else
          echo "#$n refresh conflict — will retry"
          git merge --abort >/dev/null 2>&1
        fi
        git checkout master >/dev/null 2>&1
      fi
      continue
    fi
    if [ "$mss" = "CLEAN" ]; then
      out=$(gh pr checks "$n" 2>&1); code=$?
      if echo "$out" | grep -iE "fail" | grep -viE "failed: 0" | grep -qiE "fail"; then
        echo "REAL-FAIL #$n — needs attention"
        continue
      fi
      if [ "$code" -eq 0 ]; then
        res=$(gh pr merge "$n" --squash --delete-branch 2>&1)
        echo "#$n merge → $(echo "$res" | tail -1)"
      fi
    fi
  done
  if $all_done; then echo "ALL DEPENDABOT PRs DONE"; exit 0; fi
  sleep 90
done
