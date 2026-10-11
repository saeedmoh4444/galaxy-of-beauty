#!/usr/bin/env bash
# Production DB backup — pg_dump via the running postgres container.
# Referenced by docker-compose.prod.yml. Usage:
#   BACKUP_DIR=/var/backups/gob ./scripts/backup-db.sh
# Cron (daily, keep 14): 0 3 * * * BACKUP_DIR=/var/backups/gob /app/scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
CONTAINER="${POSTGRES_CONTAINER:-gob-postgres}"
DB_USER="${POSTGRES_USER:-gob_admin}"
DB_NAME="${POSTGRES_DB:-Galaxy_of_Beauty_db}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/${DB_NAME}_${TS}.sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$OUT"
echo "backup written: $OUT"

# Rotate old backups.
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
