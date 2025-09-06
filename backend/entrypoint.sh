set -e

echo "🏁 API entrypoint: preparando banco e Prisma..."

if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "📦 migrations detectadas → prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "🧩 sem migrations → prisma db push (criando schema a partir do modelo)"
  npx prisma db push
fi

if [ -f "./prisma/seed.js" ]; then
  echo "🌱 rodando seed..."
  node ./prisma/seed.js || echo "seed falhou (ok em dev)"
else
  echo "🌱 nenhum seed detectado (pulando)"
fi

echo "🚀 iniciando Nest..."
exec node dist/main.js