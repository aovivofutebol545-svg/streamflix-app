# 🚀 Guia de OTA Updates - Streamflix

## O que é OTA (Over-The-Air)?

OTA permite **atualizar o app sem recompilar o APK**. Você faz mudanças, roda um comando, e usuários recebem automaticamente no próximo acesso.

### ✅ O que pode ser atualizado via OTA:
- ✓ UI/Estilos
- ✓ Correção de bugs
- ✓ Novo conteúdo/dados
- ✓ Textos e tradução
- ✓ Lógica JavaScript/TypeScript
- ✓ Bloqueio de anúncios
- ✓ Novas funcionalidades (sem código nativo)

### ❌ O que NÃO pode ser atualizado via OTA:
- ✗ Mudanças em código nativo (Java/Kotlin)
- ✗ Novos módulos nativos
- ✗ Mudanças de permissões Android
- Nestes casos: recompile o APK

---

## 🔄 Fluxo de Atualização

```
Você faz mudanças no código
         ↓
git commit e git push
         ↓
./scripts/publish-update.sh "1.0.5" "Descrição"
         ↓
Publicado no servidor Runable
         ↓
Usuário abre o app
         ↓
App baixa atualização automaticamente
         ↓
App reinicia com novo código
```

---

## 📱 Como Usar

### 1️⃣ **Fazer uma mudança no código**

Exemplo: Traduzir strings em inglês

```bash
# Edite os arquivos necessários
# app/player/[id].tsx
# app/(tabs)/busca.tsx
# etc...

git add -A
git commit -m "Tradução para português completo"
```

### 2️⃣ **Publicar a atualização**

```bash
./scripts/publish-update.sh "1.0.5" "Tradução completa pra português"
```

**O que acontece:**
- Script atualiza versão no `app.json`
- Faz git commit
- Envia pra servidor Runable
- Usuários recebem na próxima vez que abrem o app

### 3️⃣ **Verificar status da atualização**

```bash
curl https://soothing-lamentation366.runable.site/updates/status | jq
```

Você verá:
```json
{
  "currentUpdate": {
    "runtimeVersion": "1.0.5",
    "changelog": "Tradução completa pra português"
  },
  "hasCustomUpdate": true
}
```

### 4️⃣ **Se der problema, fazer rollback (voltar versão anterior)**

```bash
curl -X DELETE https://soothing-lamentation366.runable.site/updates/rollback
```

---

## 🎯 Exemplos de Uso

### Exemplo 1: Corrigir bloqueio de anúncios

```bash
# 1. Edite o arquivo de ad-blocking
vim app/player/[id].tsx

# 2. Teste localmente
npm run dev

# 3. Publique a atualização
./scripts/publish-update.sh "1.0.6" "Bloqueio melhorado de anúncios SuperFlix"

# ✅ Pronto! Usuários recebem quando abrem o app
```

### Exemplo 2: Traduzir interface

```bash
# 1. Traduza os arquivos
vim app/(tabs)/busca.tsx
vim app/(tabs)/index.tsx
vim app/details/[id].tsx

# 2. Teste
npm run dev

# 3. Publique
./scripts/publish-update.sh "1.0.7" "Interface 100% em português"

# Usuarios abrem app → recebem tradução automaticamente
```

### Exemplo 3: Adicionar novo recurso (JavaScript)

```bash
# 1. Desenvolva novo recurso (sem código nativo)
# Ex: novo formato de busca, novo filtro, etc

# 2. Teste
npm run dev

# 3. Publique
./scripts/publish-update.sh "1.0.8" "Novo filtro de categorias"
```

---

## 🔑 Versioning

Use **semantic versioning**: `MAJOR.MINOR.PATCH`

```
1.0.0 → primeira versão
1.0.1 → correção de bug
1.1.0 → novo recurso
2.0.0 → mudança grande
```

---

## 📊 Monitorar Atualizações

```bash
# Ver status atual
curl https://soothing-lamentation366.runable.site/updates/status

# Ver histórico (logs do servidor)
# Você pode adicionar logs no seu servidor Runable
```

---

## ⚠️ Limitações

1. **Tamanho do bundle**: Não pode ser muito grande (recomendado < 50MB)
2. **Mudanças nativas**: Se precisar mexer em código Java/Kotlin, recompile o APK
3. **Versão mínima**: Usuários com versão muito antiga do app podem não receber

---

## 🆘 Troubleshooting

### Usuários não recebem atualização

**Solução:**
1. Verifique se `/updates/status` mostra a atualização
2. Peça ao usuário fechar completamente o app e reabrir
3. Se ainda não funcionar, pode ser cache do app (usuário precisa limpar cache)

### Atualização deu erro

**Rollback imediato:**
```bash
curl -X DELETE https://soothing-lamentation366.runable.site/updates/rollback
```

### Erro: "versão obrigatória"

**Solução:**
```bash
# Certifique-se de passar a versão
./scripts/publish-update.sh "1.0.5" "Descrição da mudança"
```

---

## 📝 Checklist Antes de Publicar

- [ ] Testei localmente com `npm run dev`
- [ ] Código está commitado no git
- [ ] Versão segue formato: 1.0.0
- [ ] Descrição é clara em português
- [ ] Não mexeu em código nativo (Java/Kotlin)

---

## 💡 Próximos Passos

1. **Agora:** Faça uma mudança simples (ex: tradução)
2. **Rode:** `./scripts/publish-update.sh "1.0.5" "Tradução"`
3. **Teste:** Pede a um usuário abrir o app e verificar atualização
4. **Monitore:** Veja em `/updates/status` se foi publicado

---

## 🚀 Frequência Recomendada

- **Pequenos fixes**: 2-3x por semana ✓
- **Novas features**: 1-2x por semana ✓
- **Grandes mudanças**: 1x por mês ✓

Sem limite! OTA é feito pra isso.

---

**Dúvidas?** Consulte `/home/user/streamflix-app/updates-server.js` para detalhes técnicos.
