# ⚡ Quick Start - OTA Updates

## Copie e Cole

### 📢 Publicar Atualização

```bash
./scripts/publish-update.sh "1.0.5" "Sua descrição aqui"
```

### ✅ Verificar Status

```bash
curl https://soothing-lamentation366.runable.site/api/updates/status | jq
```

### ⏮️ Rollback (Voltar)

```bash
curl -X DELETE https://soothing-lamentation366.runable.site/api/updates/rollback
```

### 📜 Ver Histórico

```bash
curl https://soothing-lamentation366.runable.site/api/updates/history | jq
```

---

## Fluxo Completo

```bash
# 1. Faça mudanças
vim app/player/[id].tsx

# 2. Teste localmente
npm run dev

# 3. Commit
git add -A
git commit -m "Descrição da mudança"

# 4. Publique
./scripts/publish-update.sh "1.0.5" "Descrição da atualização"

# 5. Verificar
curl https://soothing-lamentation366.runable.site/api/updates/status | jq
```

---

## Versionamento

```
1.0.0 → primeira versão
1.0.1 → bug fix
1.1.0 → novo recurso
2.0.0 → mudança grande
```

Use: `./scripts/publish-update.sh "X.Y.Z" "Descrição"`

---

## Dúvidas?

Leia: `/home/user/streamflix-app/OTA_UPDATES.md`

Setup: `/home/user/SETUP_OTA_UPDATES.md`
