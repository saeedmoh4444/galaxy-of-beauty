#!/bin/bash
# Galaxy of Beauty — PostgreSQL Backup Script
# Usage: ./scripts/backup-db.sh [--restore <file>]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-Galaxy_of_Beauty_db}"
DB_USER="${POSTGRES_USER:-gob_admin}"
CONTAINER="${DB_CONTAINER:-gob-postgres}"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# ── Backup ──────────────────────────────────────────────────
do_backup() {
  local FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
  echo "[Backup] Dumping $DB_NAME to $FILE..."
  docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILE"
  echo "[Backup] Done: $(du -h "$FILE" | cut -f1)"

  # Rotate old backups
  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "[Backup] Rotated backups older than $RETENTION_DAYS days"
}

# ── Restore ─────────────────────────────────────────────────
do_restore() {
  local FILE="$1"
  if [[ ! -f "$FILE" ]]; then
    echo "[Restore] File not found: $FILE"
    exit 1
  fi
  echo "[Restore] Restoring $DB_NAME from $FILE..."
  gunzip -c "$FILE" | docker exec -i "$CONTAINER" psql -U "$DB_USER" "$DB_NAME"
  echo "[Restore] Done"
}

# ── Main ────────────────────────────────────────────────────
case "${1:-backup}" in
  --restore) do_restore "${2:?Missing file path}" ;;
  *) do_backup ;;
esac
