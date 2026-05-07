#!/bin/bash

# Script para gerar bundle de atualização OTA
# Uso: ./scripts/build-update.sh

set -e

TIMESTAMP=$(date +%s)
BUILD_DIR="builds/updates/${TIMESTAMP}"
mkdir -p "$BUILD_DIR"

echo "🏗️ Gerando bundle de atualização..."

# Gera o bundle iOS (se tiver xcode)
if command -v xcodebuild &> /dev/null; then
  echo "📱 Gerando bundle iOS..."
  npx expo export --platform ios --output-dir "$BUILD_DIR/ios" 2>/dev/null || true
fi

# Gera o bundle Android
echo "🤖 Gerando bundle Android..."
npx expo export --platform android --output-dir "$BUILD_DIR/android"

# Cria um manifest com versão e timestamp
cat > "$BUILD_DIR/manifest.json" << EOF
{
  "version": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "timestamp": $TIMESTAMP,
  "bundles": {
    "android": "$BUILD_DIR/android",
    "ios": "$BUILD_DIR/ios"
  }
}
EOF

echo "✅ Bundle gerado em: $BUILD_DIR"
echo ""
echo "📤 Para fazer upload:"
echo "   scp -r $BUILD_DIR user@seu-servidor:/updates/"
echo ""
echo "🔗 URL de atualização:"
echo "   https://soothing-lamentation366.runable.site/updates/$TIMESTAMP"
