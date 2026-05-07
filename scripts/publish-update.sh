#!/bin/bash

# Script para publicar atualização OTA
# Uso: ./scripts/publish-update.sh "1.0.5" "Corrigido bloqueio de anúncios"

set -e

VERSION=${1:-"1.0.0"}
CHANGELOG=${2:-"Atualização automática"}
SERVER_URL="https://soothing-lamentation366.runable.site"

echo "📢 Publicando atualização Streamflix v$VERSION"
echo "📝 Changelog: $CHANGELOG"
echo ""

# Valida versão
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Versão inválida! Use formato: 1.0.0"
  exit 1
fi

# Atualiza version no app.json
echo "📝 Atualizando versão no app.json..."
npx json -I -f app.json -e "this.expo.version='$VERSION'"

# Faz commit
git add app.json
git commit -m "Atualização v$VERSION: $CHANGELOG" || true

# Publica no servidor de updates
echo "🚀 Publicando para o servidor..."
curl -X POST "$SERVER_URL/updates/publish" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": \"$VERSION\",
    \"changelog\": \"$CHANGELOG\",
    \"assets\": []
  }" | jq .

echo ""
echo "✅ Atualização $VERSION publicada!"
echo "📱 Usuários receberão no próximo acesso do app"
echo ""
echo "💡 Dica: Se algo der errado, role back com:"
echo "   curl -X DELETE $SERVER_URL/updates/rollback"
