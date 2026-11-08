# Database Restore Drill (B4)

**Status:** shipped with B4 — drill at least once per quarter, and always
after any change to `scripts/backup-db.sh` or the postgres image tag.

**Principle:** a backup that was never restored is not a backup. This runbook
restores the production dump into the staging/dev postgres and verifies row
counts — full prod restore follows the same steps against the prod container
(only the target name changes).

## Prerequisites

- A backup file produced by `scripts/backup-db.sh` (daily cron, 14-day retention):
  `BACKUP_DIR=/var/backups/gob ./scripts/backup-db.sh`
- Docker + the compose stack running (`gob-postgres` container).
- The drill TARGET database must be disposable (never run this against prod
  as a "drill" — the prod path is documented at the end).

## Drill steps

```bash
# 1. Pick the newest backup
LATEST=$(ls -t /var/backups/gob/Galaxy_of_Beauty_db_*.sql.gz | head -1)
echo "drilling from: $LATEST"

# 2. Create the drill database (drop first if it exists)
docker exec gob-postgres psql -U gob_admin -d postgres \
  -c "DROP DATABASE IF EXISTS gob_restore_drill;"
docker exec gob-postgres psql -U gob_admin -d postgres \
  -c "CREATE DATABASE gob_restore_drill;"

# 3. Restore (gunzip on the host, psql inside the container)
gunzip -c "$LATEST" | docker exec -i gob-postgres \
  psql -U gob_admin -d gob_restore_drill

# 4. Verify — counts must match the source ballpark (seed + prod growth)
docker exec gob-postgres psql -U gob_admin -d gob_restore_drill -c \
  "SELECT (SELECT count(*) FROM users) AS users,
          (SELECT count(*) FROM bookings) AS bookings,
          (SELECT count(*) FROM services) AS services,
          (SELECT count(*) FROM wallet_transactions) AS wallet_tx;"

# 5. Spot-check recent data (newest bookings must be present)
docker exec gob-postgres psql -U gob_admin -d gob_restore_drill -c \
  "SELECT id, status, \"createdAt\" FROM bookings ORDER BY \"createdAt\" DESC LIMIT 5;"

# 6. Clean up
docker exec gob-postgres psql -U gob_admin -d postgres \
  -c "DROP DATABASE gob_restore_drill;"
```

## Pass criteria

- `pg_restore`/`psql` exits 0 with no ERROR lines.
- User + booking counts are within the expected range (not 0, not wildly off).
- The newest bookings present in the drill DB match production's recent state.
- **Record the drill in the ops log with the backup filename + counts.**

## Full production restore (emergency only)

1. Stop the app layer (worker + web + API) so no writes race the restore.
2. Follow steps 2-3 against the prod container, replacing the target name
   with `Galaxy_of_Beauty_db` **after** taking a fresh pre-restore dump.
3. Restart the app layer and watch Sentry/alerting for the first 30 minutes.

**Recovery objectives:** RPO ≤ 24h (daily 03:00 UTC cron), RTO ≤ 2h
(single container restore + app restart).
