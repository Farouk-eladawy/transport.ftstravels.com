#!/bin/sh
set -e

# Railway / fresh deploy: db push syncs schema.prisma directly (legacy migration SQL has UUID/TEXT bugs).
if [ -n "${RAILWAY_ENVIRONMENT:-}" ] || [ "${USE_DB_PUSH:-false}" = "true" ] || [ "${PRISMA_FRESH_DEPLOY:-false}" = "true" ]; then
  echo "[fts-transport] Syncing schema via prisma db push..."
  npx prisma db push --accept-data-loss
else
  echo "[fts-transport] Running database migrations..."
  set +e
  MIGRATE_OUT=$(npx prisma migrate deploy 2>&1)
  MIGRATE_CODE=$?
  set -e

  if [ "$MIGRATE_CODE" -ne 0 ]; then
    echo "$MIGRATE_OUT"
    if echo "$MIGRATE_OUT" | grep -q "P3009"; then
      FAILED=$(echo "$MIGRATE_OUT" | sed -n 's/.*`\([0-9][0-9]*_[^`]*\)`.*/\1/p' | head -1)
      if [ -n "$FAILED" ]; then
        echo "[fts-transport] Resolving failed migration: $FAILED"
        if echo "$MIGRATE_OUT" | grep -qi "already exists"; then
          npx prisma migrate resolve --applied "$FAILED"
        else
          npx prisma migrate resolve --rolled-back "$FAILED"
        fi
        npx prisma migrate deploy
      else
        exit 1
      fi
    else
      exit 1
    fi
  fi
fi

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  echo "[fts-transport] Seeding database in background (RUN_DB_SEED=true)..."
  (npx prisma db seed || echo "[fts-transport] WARN: seed failed") &
fi

echo "[fts-transport] Starting API on PORT=${PORT:-8080}..."
exec node dist/src/main.js
