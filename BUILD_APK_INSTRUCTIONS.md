# Build APK do Streamflix — Guia Completo

## Opção 1: Compilar Online (Recomendado — Gratuito)

### Via EAS Build (Expo) — 5 minutos

1. **Acesse**: https://expo.dev

2. **Faça login com GitHub**:
   - Clique "Sign in with GitHub"
   - Autorize

3. **Vá para**: https://expo.dev/projects

4. **Clique "New Project"** → selecione o repositório:
   ```
   aovivofutebol545-svg/streamflix-app
   ```

5. **Aguarde build automático** (3-5 min)

6. **Quando terminar, baixe o APK**:
   - Clique em "Build"
   - Procure por "download link"
   - Será um arquivo como `streamflix-free-2.0.4.apk`

---

## Opção 2: Compilar Localmente (PC com Android Studio)

### Requisitos:
- Android Studio instalado
- JDK 11+
- Node.js + Bun

### Passos:

```bash
# 1. Clone o repo
git clone https://github.com/aovivofutebol545-svg/streamflix-app.git
cd streamflix-app

# 2. Instale dependências
bun install

# 3. Instale Expo CLI
npm install -g expo-cli eas-cli

# 4. Faça login no Expo (com a conta criada)
eas login
# Email: aovivofutebol545@gmail.com
# Senha: (a que você criar)

# 5. Compile para Android
eas build --platform android --non-interactive

# 6. Quando terminar, você receberá um link pra baixar o APK
```

---

## Opção 3: Via GitHub Actions (Automático)

Já tem um workflow em `.github/workflows/build-apk.yml`.

Basta fazer push no branch `main`:
```bash
git push origin main
```

GitHub vai compilar automaticamente. Vá em "Actions" e baixe o APK quando terminar.

---

## Depois de Baixar o APK

1. **Transfira para seu telefone Android**:
   - Pelo WhatsApp, Telegram, Google Drive, etc.

2. **Instale**:
   - Abra o arquivo `.apk` no telefone
   - Clique "Instalar"
   - Permita instalação de fontes desconhecidas se pedirr

3. **Abra o app**:
   - Aparecerá como "Streamflix"
   - Tapa em Filmes, Séries, Doramas, Animes
   - Seleciona um conteúdo
   - Player abre com **sources PT-BR da API** — sem anúncios! 🎉

---

## O que Mudou Nesta Versão

✅ **Scraper Railway** — extrai .m3u8 direto, sem anúncio  
✅ **Fallback Resolver Runable** — se scraper falhar, usa embeds limpos  
✅ **Bloqueio de anúncios** — popups e redirects bloqueados  
✅ **Compatível com Filmes, Séries, Doramas, Animes, BLs**

---

## Problemas?

Se o APK não encontrar streams:
1. Verifique se o scraper tá online: `https://streamflix-scraper-production.up.railway.app/health`
2. Verifique se o Resolver tá online: `https://soothing-lamentation366.runable.site/api/health`
3. Reinicie o app
4. Tente outro filme/série

---

## Links Importantes

- **Expo**: https://expo.dev
- **Scraper Railway**: https://streamflix-scraper-production.up.railway.app
- **Resolver Runable**: https://soothing-lamentation366.runable.site
- **GitHub App**: https://github.com/aovivofutebol545-svg/streamflix-app
