# 🎬 Streamflix v2.0.4

**Filmes e Séries Dubladas em Português do Brasil - App Android com React Native Expo**

## ✨ Funcionalidades

- ✅ **Catálogo Completo**: Filmes, Séries, Doramas, Animes, BLs tudo em PT-BR
- ✅ **Player Integrado**: Reprodução sem anúncios via VidSrc
- ✅ **Busca Inteligente**: Pesquisar qualquer conteúdo com autocomplete
- ✅ **Filtro por Gêneros**: Navegue por 12+ gêneros
- ✅ **Sistema de Favoritos**: Salve seus filmes e séries favoritos
- ✅ **Interface Moderna**: Design dark mode como Netflix
- ✅ **Tudo em Português**: Interface e conteúdo 100% em PT-BR

## 🚀 Como Compilar

### Pré-requisitos
- Node.js 20+
- Bun (recomendado)
- EAS CLI (`bun add -g eas-cli`)
- Expo CLI (`bun add -g expo-cli`)

### Instalação

```bash
cd streamflix-v2.0.4
bun install
```

### Executar em Desenvolvimento

```bash
# Android emulador
bun run android

# iOS simulator
bun run ios

# Web
bun run web

# Expo Go (mobile)
bun run start
```

### Build para Android

```bash
# Build local (rápido)
bun run build:android

# Build EAS (mantém versão, melhor para distribuição)
eas build --platform android --auto-submit
```

## 📁 Estrutura do Projeto

```
streamflix-v2.0.4/
├── app/
│   ├── _layout.tsx           # Root navigation
│   ├── (tabs)/              # Abas principais
│   │   ├── index.tsx        # 🏠 Home
│   │   ├── busca.tsx        # 🔍 Search
│   │   ├── categorias.tsx   # 🎬 Genres
│   │   └── favoritos.tsx    # ❤️ Favorites
│   ├── details/[id].tsx     # Detalhes do item
│   └── player/[id].tsx      # Player de vídeo
├── components/
│   ├── MovieCard.tsx        # Card do filme
│   ├── SearchBar.tsx        # Barra de busca
│   └── CategorySection.tsx  # Seletor de gêneros
├── constants/
│   └── colors.ts           # Tema e cores
├── services/
│   └── api.ts              # API TMDB e VidSrc
├── store/
│   └── favorites.ts        # Zustand store
└── app.json                # Config Expo
```

## 🎨 Customização

### Cores
Edit `constants/colors.ts`:
```typescript
export const COLORS = {
  primary: '#E50914',      // Vermelho Netflix
  background: '#0F1419',   // Preto bem escuro
  // ... mais cores
};
```

### API TMDB
A chave já está configurada em `services/api.ts`:
```typescript
const TMDB_API_KEY = 'e86975bc7a2c1fb2e3ecd4d0e9f9b5f';
```

Para usar sua própria chave: https://www.themoviedb.org/settings/api

### Provider de Vídeo
Atualmente usa **VidSrc.to** (sem configuração necessária).

Alterar em `services/api.ts` > `getVidSrcUrl()`:
```typescript
// Mudar para outro provider conforme necessário
```

## 📱 Funcionalidades Detalhadas

### Home
- Banner com destaque em tendência
- Seções de: Trending, Doramas, Animes, Dublados PT-BR
- Cada filme/série mostra: poster, título, nota IMDb
- Toque para ver detalhes

### Buscar
- Busca em tempo real
- Filtra: filmes, séries, doramas, animes
- Autocomplete com debounce

### Gêneros
- Selecione tipo: 🎬 Filmes ou 📺 Séries
- Escolha gênero
- Grid de resultados
- Filtra por região Brasil

### Favoritos
- Marca ❤️ em qualquer conteúdo
- Salva localmente no AsyncStorage
- Persiste ao fechar e reabrir

### Detalhes
- Poster + backdrop
- Sinopse completa
- Nota IMDb
- Gêneros
- Data de lançamento
- Duração (filmes) ou temporadas (séries)
- Botão "Assistir"
- Adicionar/remover favoritos

### Player
- Reproduz sem anúncios
- Suporta fullscreen
- Navegação automática de temporadas/episódios (em breve)

## 🐛 Troubleshooting

### "Cannot read property 'colors' of undefined"
✅ **CORRIGIDO** em v2.0.4 - Tema agora é importado corretamente

### App fecha ao abrir
1. Limpe cache: `bun run android -- --reset-cache`
2. Reinstale: `expo install`
3. Verifique Node.js version

### Vídeo não carrega
- VidSrc.to às vezes está lento
- Tente novamente em alguns minutos
- Verifique conexão de internet

### Busca lenta
- Debounce está em 500ms
- Aumentar em `busca.tsx` se necessário

## 📊 APIs Utilizadas

- **TMDB**: Dados de filmes, séries, gêneros
- **VidSrc.to**: Player de vídeo sem anúncios
- **AsyncStorage**: Favoritos local

## 📄 Licença

Uso pessoal apenas. Streamflix não é afiliado com Netflix, TMDB ou VidSrc.

## 🤝 Contribuições

Sinta-se livre para criar issues ou PRs!

---

**Made with ❤️ by Kaique Almeida**

v2.0.4 - Sem crashes, tudo funcionando! 🚀
