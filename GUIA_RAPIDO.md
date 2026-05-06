# 🚀 Guia Rápido - Streamflix v2.0.4

## ✅ O que foi corrigido

- ✅ **CRASH RESOLVIDO**: Erro `Cannot read property 'colors' of undefined`
- ✅ **Nova estrutura** de tema centralizada em `constants/colors.ts`
- ✅ **Importações corretas** em todos os componentes
- ✅ **Testes com TypeScript** para evitar erros em build-time

## 📦 Como Começar

### 1. Entrar na pasta
```bash
cd /home/user/streamflix-v2.0.4
```

### 2. Instalar dependências
```bash
bun install
```

### 3. Rodar localmente (desenvolvimento)
```bash
bun run start
```

Depois:
- Escaneie o QR com **Expo Go** (Android)
- Ou `bun run android` para emulador Android

## 🎯 Compilar APK para Android

### Opção 1: Build Local Rápido (dev)
```bash
bun run android
```

### Opção 2: Build EAS (produção - recomendado)
```bash
# Primeiro, authenticate
eas login

# Depois, compile
eas build --platform android

# Baixe o APK quando terminar
```

## 📱 Testar no Celular

1. **Com Expo Go** (mais rápido):
   - Instale Expo Go do Play Store
   - Rode: `bun run start`
   - Escaneie QR

2. **APK Direto**:
   - Compile com EAS ou local
   - Transfira o APK pro celular
   - Instale

## 🎨 Interface

### Home (Aba 1 - 🏠)
- Banner com filme destaque
- Seções: Trending, Doramas, Animes, Dublados PT-BR
- Toque no filme para detalhes

### Buscar (Aba 2 - 🔍)
- Campo de busca no topo
- Resultados em tempo real
- Filtra filmes, séries, animes, etc

### Gêneros (Aba 3 - 🎬)
- Toggle: Filmes / Séries
- Selecione gênero
- Grid de resultados

### Favoritos (Aba 4 - ❤️)
- Lista de favoritos salvos
- Toque em filme > botão ❤️ para adicionar
- Salva automaticamente

## 🔧 Customizações Comuns

### Mudar cor principal (vermelho)
`constants/colors.ts`:
```typescript
primary: '#YOUR_COLOR',  // ex: '#E50914' é vermelho Netflix
```

### Adicionar nova aba
Edite `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen name="nova" ... />
```

Crie arquivo: `app/(tabs)/nova.tsx`

### Mudar API TMDB
`services/api.ts`:
```typescript
const TMDB_API_KEY = 'YOUR_KEY';
```
Obtenha em: https://www.themoviedb.org/settings/api

## 📊 Sobre o conteúdo

- **Filmes/Séries**: Puxados do TMDB (base de dados)
- **Doramas**: Séries coreanas e japonesas
- **Animes**: Animações japonesas
- **Dublados PT-BR**: Conteúdo em português
- **Player**: VidSrc.to (sem anúncios)

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| App não abre | `bun install` + `bun run android --reset-cache` |
| Erro de tema | Abra `constants/colors.ts` e verifique se está exportado |
| Vídeo não carrega | VidSrc.to pode estar lento, tente novamente |
| Busca muito lenta | Debounce em 500ms em `busca.tsx` |
| Favoritos desaparecem | AsyncStorage pode estar corrompido, limpe cache |

## 📝 Estrutura de Pastas

```
streamflix-v2.0.4/
├── app/                    # Telas e rotas
│   ├── (tabs)/            # 4 abas principais
│   ├── details/[id].tsx   # Detalhes do filme
│   └── player/[id].tsx    # Player
├── components/            # Componentes reutilizáveis
├── constants/             # Cores, temas, constantes
├── services/              # APIs e requisições
├── store/                 # Estado global (Zustand)
└── app.json              # Config Expo
```

## 🎬 Exemplo de Uso

1. Abra **Home**
2. Toque em qualquer filme
3. Veja detalhes + descrição
4. Clique **▶ Assistir**
5. Aproveite sem anúncios!

## 🌐 Offline?

O app **precisa de internet** para:
- Carregar filmes
- Buscar conteúdo
- Reproduzir vídeos

Favoritos são salvos **localmente** e funcionam offline.

## 🚀 Próximas Features (TODO)

- [ ] Download para offline
- [ ] Histórico de assistência
- [ ] Recomendações personalizadas
- [ ] Dark/Light mode toggle
- [ ] Multi-idioma (mais além de PT-BR)
- [ ] Notificações de novo conteúdo

---

**Pronto pra começar? Execute:**
```bash
cd /home/user/streamflix-v2.0.4
bun install
bun run start
```

Aproveita! 🍿🎬
