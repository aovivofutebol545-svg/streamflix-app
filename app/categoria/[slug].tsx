import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchTrendingContent, fetchDoramas, fetchAnimes,
  fetchDublados, fetchPopularMovies, fetchPopularSeries,
  fetchNowPlaying, fetchBLs, fetchContentByGenre, Content,
} from '../../services/api';
import { MovieCard } from '../../components/MovieCard';

const LOADERS: Record<string, (page: number) => Promise<Content[]>> = {
  tendencia: (p) => fetchTrendingContent('movie'),
  cartaz: fetchNowPlaying,
  dublados: fetchDublados,
  series: fetchPopularSeries,
  doramas: fetchDoramas,
  bls: fetchBLs,
  animes: fetchAnimes,
  filmes: fetchPopularMovies,
};

export default function CategoriaScreen() {
  const { slug, title, genre, type } = useLocalSearchParams<{
    slug: string; title: string; genre?: string; type?: string;
  }>();
  const router = useRouter();
  const [items, setItems] = useState<Content[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { load(1); }, [slug]);

  const load = async (p: number) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      let data: Content[] = [];
      if (genre) {
        data = await fetchContentByGenre((type as 'movie' | 'tv') || 'movie', parseInt(genre), p);
      } else if (slug && LOADERS[slug]) {
        data = await LOADERS[slug](p);
      }

      setItems(prev => p === 1 ? data : [...prev, ...data]);
      setPage(p);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  };

  const loadMore = () => { if (!loadingMore) load(page + 1); };

  if (loading) {
    return (
      <View style={s.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{title || slug}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        numColumns={3}
        contentContainerStyle={s.list}
        columnWrapperStyle={s.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#E50914" style={{ margin: 20 }} /> : null}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C14' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0C14' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C2235', justifyContent: 'center', alignItems: 'center' },
  backTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  list: { paddingHorizontal: 8, paddingBottom: 100 },
  row: { justifyContent: 'flex-start', gap: 8, marginBottom: 8 },
});
