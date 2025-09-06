#!/bin/sh
set -e

echo "🏁 API entrypoint: preparando banco e Prisma..."

if npx prisma migrate deploy 2>/dev/null; then
  echo "📦 migrations aplicadas"
else
  echo "📦 sem migrations -> prisma db push"
  npx prisma db push
fi

echo "🌱 rodando seed..."
node prisma/seed.js || true
echo "Seed concluído"

START_FILE=""
for CAND in \
  dist/main.js \
  dist/src/main.js \
  dist/main.cjs \
  dist/src/main.cjs \
  dist/apps/backend/main.js \
  dist/apps/backend/src/main.js
do
  if [ -f "$CAND" ]; then
    START_FILE="$CAND"
    break
  fi
done

if [ -z "$START_FILE" ]; then
  echo "❌ Não encontrei arquivo de entrada em dist/. Conteúdo atual:"
  ls -la dist || true
  exit 1
fi

echo "🚀 iniciando Nest em $START_FILE..."
exec node "$START_FILE"
