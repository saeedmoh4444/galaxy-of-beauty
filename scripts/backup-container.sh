#!/usr/bin/env bash
# Production DB backup — container mode (runs INSIDE the backup sidecar,
# no docker socket needed: pg_dump connects over the compose network).
# Companion to backup-db.sh (host mode via `docker exec`).
#
# Env: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE,
#      BACKUP_DIR (default /backups), RETENTION_DAYS (default 14).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/${PGDATABASE:-Galaxy_of_Beauty_db}_${TS}.sql.gz"

# PGPASSWORD is consumed by pg_dump via the env — never passed as a flag.
pg_dump --no-owner --clean | gzip > "$OUT"
echo "backup written: $OUT"

# Rotate old backups.
find "$BACKUP_DIR" -name '*_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
