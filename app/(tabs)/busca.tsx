import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, FlatList, ActivityIndicator,
  Text, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  searchContent, fetchPopularMovies, fetchPopularSeries,
  fetchTrendingContent, Content,
} from '../../services/api';
import { MovieCard } from '../../components/MovieCard';

const GENRES = [
  { id: 28, name: 'Ação', emoji: '💥', type: 'movie' },
  { id: 35, name: 'Comédia', emoji: '😂', type: 'movie' },
  { id: 18, name: 'Drama', emoji: '🎭', type: 'movie' },
  { id: 27, name: 'Terror', emoji: '👻', type: 'movie' },
  { id: 878, name: 'Ficção', emoji: '🚀', type: 'movie' },
  { id: 10749, name: 'Romance', emoji: '❤️', type: 'movie' },
  { id: 53, name: 'Suspense', emoji: '🔪', type: 'movie' },
  { id: 16, name: 'Animação', emoji: '🎌', type: 'tv' },
  { id: 10751, name: 'Família', emoji: '👨‍👩‍👧', type: 'movie' },
  { id: 80, name: 'Crime', emoji: '🕵️', type: 'movie' },
  { id: 14, name: 'Fantasia', emoji: '🧙', type: 'movie' },
  { id: 12, name: 'Aventura', emoji: '🗺️', type: 'movie' },
  { id: 10752, name: 'Guerra', emoji: '⚔️', type: 'movie' },
  { id: 36, name: 'História', emoji: '📜', type: 'movie' },
  { id: 10402, name: 'Música', emoji: '🎵', type: 'movie' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q || '');
  const [results, setResults] = useState<Content[]>([]);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Carrega conteúdo "discover" ao abrir
  useEffect(() => {
    loadAllContent();
  }, []);

  // Busca quando digitar
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(performSearch, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Se vier query via params (chips de busca rápida)
  useEffect(() => {
    if (params.q) { setQuery(params.q); }
  }, [params.q]);

  const loadAllContent = async (p = 1) => {
    try {
      if (p === 1) setLoadingAll(true);
      else setLoadingMore(true);

      const [movies, series, trending] = await Promise.all([
        fetchPopularMovies(p),
        fetchPopularSeries(p),
        p === 1 ? fetchTrendingContent('movie') : Promise.resolve([]),
      ]);

      const combined = [...(p === 1 ? trending : []), ...movies, ...series]
        .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i); // dedup

      setAllContent(prev => p === 1 ? combined : [...prev, ...combined]);
      setPage(p);
    } catch {}
    finally { setLoadingAll(false); setLoadingMore(false); }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const data = await searchContent(query, 'multi');
      setResults(data.filter(item => item.poster_path));
    } catch {}
    finally { setLoading(false); }
  };

  const displayData = query.trim() ? results : allContent;
  const isSearching = query.trim().length > 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />

      {/* Header + busca */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🔍 Buscar</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>🔍</Text>
          <TextInput
            style={s.input}
            placeholder="Filmes, séries, doramas, animes..."
            placeholderTextColor="#8892AA"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={performSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
              <Text style={s.clearTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips de gêneros (só quando não está buscando) */}
      {!isSearching && (
        <View style={s.genreWrap}>
          <FlatList
            data={GENRES}
            keyExtractor={g => g.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.genreList}
            renderItem={({ item: g }) => (
              <TouchableOpacity
                style={s.genreChip}
                onPress={() => router.push(
                  `/categoria/genero?genre=${g.id}&type=${g.type}&title=${encodeURIComponent(g.emoji + ' ' + g.name)}`
                )}
                activeOpacity={0.75}
              >
                <Text style={s.genreEmoji}>{g.emoji}</Text>
                <Text style={s.genreName}>{g.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Título da seção */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>
          {isSearching
            ? loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`
            : '🎬 Todos os filmes e séries'}
        </Text>
      </View>

      {/* Grid */}
      {loadingAll && !isSearching ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={s.loadTxt}>Carregando...</Text>
        </View>
      ) : loading && isSearching ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={3}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          onEndReached={() => { if (!isSearching && !loadingMore) loadAllContent(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎬</Text>
              <Text style={s.emptyTxt}>
                {isSearching ? `Nenhum resultado para "${query}"` : 'Nenhum conteúdo disponível'}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#E50914" style={{ margin: 20 }} /> : null
          }
          renderItem={({ item }) => (
            <MovieCard
              id={item.id}
              title={'title' in item ? item.title : item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              onPress={() => router.push(`/details/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C14' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C2235', borderRadius: 14,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: '#2A3350',
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  clearBtn: { padding: 4 },
  clearTxt: { color: '#8892AA', fontSize: 16 },
  genreWrap: { marginBottom: 8 },
  genreList: { paddingHorizontal: 16, gap: 8 },
  genreChip: {
    backgroundColor: '#1C2235', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A3350', minWidth: 72,
  },
  genreEmoji: { fontSize: 20, marginBottom: 3 },
  genreName: { color: '#C8CEDF', fontSize: 10, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { color: '#8892AA', fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 8, paddingBottom: 100 },
  row: { justifyContent: 'flex-start', gap: 8, marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadTxt: { color: '#8892AA', marginTop: 12, fontSize: 14 },
  emptyTxt: { color: '#8892AA', fontSize: 15, textAlign: 'center' },
});
