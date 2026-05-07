#!/bin/bash

# Script para criar APK instalável do Streamflix
echo "🔨 Construindo APK do Streamflix..."

# 1. Verifica se expo export foi feito
if [ ! -d "apk-build" ]; then
    echo "📦 Fazendo expo export..."
    npx expo export --platform android --output-dir=./apk-build
fi

# 2. Compacta em ZIP
echo "📦 Empacotando..."
mkdir -p ./releases
zip -r "./releases/streamflix-v2.0.4.zip" apk-build/ > /dev/null 2>&1

# 3. Cria documentação de instalação
cat > ./releases/INSTRUCOES.txt << 'INSTOC'
🎬 STREAMFLIX v2.0.4

Para instalar este app no seu celular, você tem 2 opções:

OPÇÃO 1: Usar o Expo Go (Mais fácil, sem APK)
=====================================
1. Baixe o app "Expo Go" na Play Store
2. Acesse: https://expo.dev/@seu-usuario/streamflix-free
3. Escaneia o QR code com câmera
4. App abre no Expo Go

OPÇÃO 2: Compilar APK (Precisa de ferramenta)
==============================================
1. Descompacte este ZIP
2. Use com EAS Build: eas build --platform android
3. Ou use com expo-router build
4. Instale o APK gerado no seu celular

O QUE TEM NESTA VERSÃO:
- ✅ Bloqueio de anúncios aprimorado
- ✅ OTA Updates (atualizar sem recompilar)
- ✅ Player com Resolver Runable
- ✅ Busca TMDB
- ✅ Favoritos local

ATUALIZAR DEPOIS:
./scripts/publish-update.sh "1.0.5" "Descrição"

Usuarios recebem automaticamente!
INSTOC

echo "✅ APK preparado!"
echo ""
echo "Arquivos criados:"
echo "  - releases/streamflix-v2.0.4.zip"
echo "  - releases/INSTRUCOES.txt"
echo ""
echo "Para instalar no celular:"
echo "  1. Descompacte o ZIP"
echo "  2. Use com ferramentas Expo ou EAS"
echo "  3. Ou compartilhe com develop/compile externamente"

