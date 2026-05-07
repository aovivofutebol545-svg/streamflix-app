import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchContentByGenre, Content } from '../../services/api';
import { MovieCard } from '../../components/MovieCard';

export default function GenreScreen() {
  const { genre, type, title } = useLocalSearchParams<{
    genre: string; type: string; title: string;
  }>();
  const router = useRouter();

  const [items, setItems] = useState<Content[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Carrega na montagem
  const init = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);
    await loadPage(1);
  }, [genre, type]);

  React.useEffect(() => { init(); }, [init]);

  const loadPage = async (p: number) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await fetchContentByGenre(
        (type as 'movie' | 'tv') || 'movie',
        parseInt(genre || '28'),
        p,
      );

      setItems(prev => p === 1 ? data : [...prev, ...data]);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loading && items.length > 0) {
      loadPage(page + 1);
    }
  };

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
        <Text style={s.headerTitle} numberOfLines={1}>
          {decodeURIComponent(title || 'Gênero')}
        </Text>
        <View style={[s.typeBadge, type === 'tv' ? s.typeTv : s.typeMovie]}>
          <Text style={s.typeTxt}>{type === 'tv' ? 'Série' : 'Filme'}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        numColumns={3}
        contentContainerStyle={s.list}
        columnWrapperStyle={s.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyTxt}>Nenhum resultado encontrado</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator color="#E50914" style={{ marginVertical: 20 }} />
            : null
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C14' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0C14' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  back: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1C2235',
    justifyContent: 'center', alignItems: 'center',
  },
  backTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeMovie: { backgroundColor: '#E50914' },
  typeTv: { backgroundColor: '#1565C0' },
  typeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  list: { paddingHorizontal: 8, paddingBottom: 100 },
  row: { justifyContent: 'flex-start', gap: 8, marginBottom: 8 },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#8A8FA8', fontSize: 16 },
});
