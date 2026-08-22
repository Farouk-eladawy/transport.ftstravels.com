#!/bin/sh
set -e

echo "[fts-transport] Running database migrations..."
npx prisma migrate deploy

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  echo "[fts-transport] Seeding database (RUN_DB_SEED=true)..."
  npx prisma db seed
fi

echo "[fts-transport] Starting API on PORT=${PORT:-3001}..."
exec node dist/src/main.js
