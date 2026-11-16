#!/usr/bin/env bash
# Production DB restore — companion to backup-container.sh / backup-db.sh
# (W6-5: the backup path existed with no tested way back).
#
# Restores a .sql.gz backup INTO the running database. Two modes:
#
# 1. Sidecar mode (default — the prod compose topology):
#      ./scripts/restore-db.sh Galaxy_of_Beauty_db_20261116T030000Z.sql.gz
#    Runs inside the backup sidecar (which carries PG* env and sits on
#    gob-network), streaming the dump into psql on the postgres service.
#
# 2. Host mode (docker exec against the postgres container):
#      RESTORE_MODE=host ./scripts/restore-db.sh <file-or-latest>
#    Uses scripts/backup-db.sh's host conventions (BACKUP_DIR, container).
#
# Safety:
#   - refuses to run without an explicit file argument ("latest" is opt-in
#     via the file name `latest` and always prints which file it picked)
#   - takes a pre-restore safety dump to BACKUP_DIR/restore-safety_*.sql.gz
#   - requires RESTORE_CONFIRM=yes to touch the default (production) DB
#     name unless RESTORE_ALLOW_PROD=1
#   - verifies connectivity with a table count after the restore
#
# The dump files are written with `pg_dump --no-owner --clean`, so they
# drop/recreate objects on restore (not additive — the DB is replaced by
# the backup's contents).
set -euo pipefail

FILE_ARG="${1:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${PGDATABASE:-Galaxy_of_Beauty_db}"
CONTAINER="${POSTGRES_CONTAINER:-gob-postgres}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if [ -z "$FILE_ARG" ]; then
  echo "usage: $0 <backup-file.sql.gz | latest>" >&2
  echo "backups in $BACKUP_DIR:" >&2
  ls -1 "$BACKUP_DIR" 2>/dev/null | grep '\.sql\.gz$' || echo "  (none found)" >&2
  exit 1
fi

if [ "$FILE_ARG" = "latest" ]; then
  FILE_ARG="$(ls -1t "$BACKUP_DIR" | grep '\.sql\.gz$' | head -1 || true)"
  if [ -z "$FILE_ARG" ]; then
    echo "no backups found in $BACKUP_DIR" >&2
    exit 1
  fi
  echo "restoring latest backup: $FILE_ARG"
fi

if [ "${RESTORE_CONFIRM:-}" != "yes" ]; then
  echo "refusing: set RESTORE_CONFIRM=yes to restore $FILE_ARG into $DB_NAME" >&2
  exit 1
fi

if [ "$DB_NAME" = "Galaxy_of_Beauty_db" ] && [ "${RESTORE_ALLOW_PROD:-0}" != "1" ]; then
  echo "refusing: $DB_NAME looks like production. Set RESTORE_ALLOW_PROD=1 to override." >&2
  exit 1
fi

# Pre-restore safety dump (host mode path — the file lands next to the
# other backups and rotates with them).
SAFETY_TS="$(date -u +%Y%m%dT%H%M%SZ)"
SAFETY="$BACKUP_DIR/restore-safety_${DB_NAME}_${SAFETY_TS}.sql.gz"
echo "pre-restore safety dump → $SAFETY"
if [ "${RESTORE_MODE:-sidecar}" = "host" ]; then
  docker exec "$CONTAINER" pg_dump -U "${POSTGRES_USER:-gob_admin}" -d "$DB_NAME" | gzip > "$SAFETY"
else
  docker compose -f "$COMPOSE_FILE" exec -T backup sh -c \
    "pg_dump --no-owner | gzip" > "$SAFETY"
fi

echo "restoring $FILE_ARG → $DB_NAME"
if [ "${RESTORE_MODE:-sidecar}" = "host" ]; then
  gzip -dc "$BACKUP_DIR/$FILE_ARG" |
    docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 \
      -U "${POSTGRES_USER:-gob_admin}" -d "$DB_NAME"
else
  gzip -dc "$BACKUP_DIR/$FILE_ARG" |
    docker compose -f "$COMPOSE_FILE" exec -T backup psql -v ON_ERROR_STOP=1
fi

# Post-restore verification: the schema must be queryable.
echo "verify: table count"
if [ "${RESTORE_MODE:-sidecar}" = "host" ]; then
  docker exec "$CONTAINER" psql -U "${POSTGRES_USER:-gob_admin}" -d "$DB_NAME" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"
else
  docker compose -f "$COMPOSE_FILE" exec -T backup psql -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"
fi

echo "restore complete. Safety dump: $SAFETY (delete after verification)."
