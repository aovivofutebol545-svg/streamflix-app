import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, FlatList, SafeAreaView, Text,
  TouchableOpacity, Image, ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { THEME } from '../../constants/colors';
import { useFavoritesStore } from '../../store/favorites';

const TMDB_KEY = '9e61081071c195fca2147469bd25690e';
const IMG_BASE = 'https://image.tmdb.org/t/p/w342';

interface FavItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path: string;
  vote_average?: number;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavoritesStore();
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useFocusEffect(useCallback(() => {
    fetchRatings();
  }, [favorites.length]));

  const fetchRatings = async () => {
    if (favorites.length === 0) return;
    setLoadingRatings(true);
    const pending = favorites.filter(f => ratings[f.id] === undefined);
    const results = await Promise.allSettled(
      pending.map(async (f) => {
        const endpoint = f.type === 'tv'
          ? `https://api.themoviedb.org/3/tv/${f.id}?api_key=${TMDB_KEY}&language=pt-BR`
          : `https://api.themoviedb.org/3/movie/${f.id}?api_key=${TMDB_KEY}&language=pt-BR`;
        const res = await fetch(endpoint);
        const data = await res.json();
        return { id: f.id, vote: data.vote_average || 0 };
      })
    );
    const newRatings: Record<number, number> = { ...ratings };
    results.forEach(r => {
      if (r.status === 'fulfilled') newRatings[r.value.id] = r.value.vote;
    });
    setRatings(newRatings);
    setLoadingRatings(false);
  };

  const filtered = favorites.filter(f => filter === 'all' || f.type === filter);

  const renderStars = (vote: number) => {
    const stars = Math.round((vote / 10) * 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🎬</Text>
          <Text style={s.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={s.emptySub}>Adicione filmes e séries{'\n'}para vê-los aqui</Text>
          <TouchableOpacity style={s.exploreBtn} onPress={() => router.push('/(tabs)/')}>
            <Text style={s.exploreTxt}>Explorar conteúdo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Meus Favoritos</Text>
        <Text style={s.headerCount}>{favorites.length} título{favorites.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter chips */}
      <View style={s.chips}>
        {(['all', 'movie', 'tv'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>
              {f === 'all' ? 'Todos' : f === 'movie' ? '🎬 Filmes' : '📺 Séries'}
            </Text>
          </TouchableOpacity>
        ))}
        {loadingRatings && <ActivityIndicator size="small" color="#E50914" style={{ marginLeft: 8 }} />}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const vote = ratings[item.id];
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/details/${item.id}`)}
              activeOpacity={0.75}
            >
              {item.poster_path ? (
                <Image
                  source={{ uri: `${IMG_BASE}${item.poster_path}` }}
                  style={s.poster}
                  resizeMode="cover"
                />
              ) : (
                <View style={[s.poster, s.posterFallback]}>
                  <Text style={s.posterFallbackTxt}>🎬</Text>
                </View>
              )}

              {/* Badge tipo */}
              <View style={[s.badge, item.type === 'tv' ? s.badgeTv : s.badgeMovie]}>
                <Text style={s.badgeTxt}>{item.type === 'tv' ? 'S' : 'F'}</Text>
              </View>

              {/* Remove btn */}
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => removeFavorite(item.id)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={s.removeTxt}>✕</Text>
              </TouchableOpacity>

              <View style={s.info}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                {vote !== undefined ? (
                  <View style={s.ratingRow}>
                    <Text style={s.stars}>{renderStars(vote)}</Text>
                    <Text style={s.ratingNum}>{vote.toFixed(1)}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C14' },

  /* Empty */
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#8A8FA8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  exploreBtn: { backgroundColor: '#E50914', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  exploreTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerCount: { color: '#8A8FA8', fontSize: 14 },

  /* Chips */
  chips: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1C2235', borderWidth: 1, borderColor: '#2A3350' },
  chipActive: { backgroundColor: '#E50914', borderColor: '#E50914' },
  chipTxt: { color: '#8A8FA8', fontSize: 13, fontWeight: '600' },
  chipTxtActive: { color: '#fff' },

  /* Grid */
  list: { paddingHorizontal: 8, paddingBottom: 120 },
  row: { gap: 8, marginBottom: 8 },

  /* Card */
  card: { flex: 1, maxWidth: '31%' },
  poster: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: '#1C2235' },
  posterFallback: { justifyContent: 'center', alignItems: 'center' },
  posterFallbackTxt: { fontSize: 32 },

  badge: { position: 'absolute', top: 6, left: 6, width: 20, height: 20, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  badgeMovie: { backgroundColor: '#E50914' },
  badgeTv: { backgroundColor: '#1565C0' },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  removeBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  removeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },

  info: { paddingTop: 6, paddingBottom: 4 },
  cardTitle: { color: '#E0E0E0', fontSize: 11, fontWeight: '600', lineHeight: 15 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  stars: { color: '#FFD700', fontSize: 9 },
  ratingNum: { color: '#8A8FA8', fontSize: 10 },
});
