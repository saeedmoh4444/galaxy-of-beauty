#!/bin/bash
# Cascade babysitter — polls the open PR board, re-arms update-branch on
# BEHIND (the strict-protection ritual after every merge), and exits with
# an error only when a PR's LATEST run has actually failed (stale check
# results from superseded runs are ignored).
cd /c/Users/saeed/Desktop/under_working/beauty_project || exit 1

for i in $(seq 1 40); do
  echo "=== poll $i $(date -u +%H:%M:%S) ==="
  for n in $(rtk gh pr list --state open --json number --jq '.[].number' 2>/dev/null); do
    ms=$(rtk gh pr view "$n" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null)
    if [ "$ms" = "BEHIND" ] || [ "$ms" = "DIRTY" ]; then
      echo "PR $n $ms -> update-branch + re-arm"
      rtk gh pr update-branch "$n" 2>&1 | head -1
      rtk gh pr merge "$n" --auto --squash >/dev/null 2>&1
      echo "  PR $n: updated"
      continue
    fi
    fails=$(rtk gh pr checks "$n" 2>/dev/null | grep -c "fail")
    if [ "$fails" -gt 0 ]; then
      # Is the failing result from the LATEST run? A superseded run's
      # failures show up until the new run completes.
      latest=$(rtk gh run list --json databaseId,status --jq '.[0] | .status' 2>/dev/null)
      # gh pr checks columns: name, conclusion, duration, url — match the
      # PR's own head run instead.
      headref=$(rtk gh pr view "$n" --json headRefName --jq .headRefName 2>/dev/null)
      runstate=$(rtk gh run list --branch "$headref" --limit 1 --json status --jq '.[0].status' 2>/dev/null)
      if [ "$runstate" = "in_progress" ] || [ "$runstate" = "pending" ] || [ "$runstate" = "queued" ]; then
        echo "PR $n has stale failing checks (latest run $runstate) — waiting"
        continue
      fi
      echo "PR $n has FAILING checks on its latest run ($runstate) — exiting for manual fix"
      rtk gh pr checks "$n" 2>/dev/null | grep "fail" | head -5
      exit 1
    fi
    echo "  PR $n: $ms"
  done
  open=$(rtk gh pr list --state open --json number --jq 'length' 2>/dev/null)
  echo "open PRs: $open"
  if [ "$open" = "0" ]; then
    echo "BOARD ZERO — all PRs merged."
    exit 0
  fi
  sleep 180
done
echo "watcher loop exhausted"
exit 0
