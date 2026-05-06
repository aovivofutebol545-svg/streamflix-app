import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  fetchTrendingContent,
  fetchDoramas,
  fetchAnimes,
  fetchDublados,
  fetchPopularMovies,
  fetchPopularSeries,
  fetchNowPlaying,
  fetchBLs,
  getImageUrl,
  Content,
} from '../../services/api';
import { MovieCard } from '../../components/MovieCard';
import { SearchBar } from '../../components/SearchBar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState<Content[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Content[]>([]);
  const [popularSeries, setPopularSeries] = useState<Content[]>([]);
  const [doramas, setDoramas] = useState<Content[]>([]);
  const [animes, setAnimes] = useState<Content[]>([]);
  const [dublados, setDublados] = useState<Content[]>([]);
  const [bls, setBls] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimer = useRef<any>(null);

  useEffect(() => {
    loadContent();
    return () => clearInterval(bannerTimer.current);
  }, []);

  useEffect(() => {
    if (trending.length > 1) {
      bannerTimer.current = setInterval(() => {
        setBannerIndex((i) => (i + 1) % Math.min(trending.length, 5));
      }, 4000);
    }
    return () => clearInterval(bannerTimer.current);
  }, [trending]);

  const loadContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [t, np, ps, d, a, dub, bl] = await Promise.all([
        fetchTrendingContent('movie'),
        fetchNowPlaying(),
        fetchPopularSeries(),
        fetchDoramas(),
        fetchAnimes(),
        fetchDublados(),
        fetchBLs(),
      ]);

      setTrending(t);
      setNowPlaying(np);
      setPopularSeries(ps);
      setDoramas(d);
      setAnimes(a);
      setDublados(dub);
      setBls(bl);
    } catch {
      setError('Sem conexão. Puxe pra baixo para tentar novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => loadContent(true), []);

  const renderBanner = () => {
    if (!trending.length) return null;
    const item = trending[bannerIndex] || trending[0];
    const imageUrl = getImageUrl(item.backdrop_path, 'w780');
    const title = 'title' in item ? item.title : item.name;
    const rating = item.vote_average?.toFixed(1);

    return (
      <TouchableOpacity
        style={styles.banner}
        onPress={() => router.push(`/details/${item.id}`)}
        activeOpacity={0.9}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.bannerImg} resizeMode="cover" />
        ) : (
          <View style={[styles.bannerImg, { backgroundColor: '#1A1F2E' }]} />
        )}
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerDots}>
            {trending.slice(0, 5).map((_, i) => (
              <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
            ))}
          </View>
          <Text style={styles.bannerTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.bannerRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingPillText}>⭐ {rating}</Text>
            </View>
            <TouchableOpacity
              style={styles.watchBtn}
              onPress={() => router.push(`/details/${item.id}`)}
            >
              <Text style={styles.watchBtnText}>▶  Assistir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (emoji: string, title: string, data: Content[]) => {
    if (!data?.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{emoji} {title}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data.slice(0, 12)}
          keyExtractor={(item) => `${title}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listPad}
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
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error && !trending.length) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📡</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadContent()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E50914"
            colors={['#E50914']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>STREAMFLIX</Text>
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={() => router.push('/(tabs)/busca')}
          >
            <Text style={{ fontSize: 22 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Buscar filmes e séries..."
          value=""
          onChangeText={() => {}}
          onFocus={() => router.push('/(tabs)/busca')}
        />

        {/* Banner rotativo */}
        {renderBanner()}

        {/* Seções */}
        {renderSection('🔥', 'Em Tendência', trending.slice(1))}
        {renderSection('🎬', 'Em Cartaz', nowPlaying)}
        {renderSection('🇧🇷', 'Dublados PT-BR', dublados)}
        {renderSection('📺', 'Séries Populares', popularSeries)}
        {renderSection('🌸', 'Doramas', doramas)}
        {renderSection('🏳️‍🌈', 'BLs', bls)}
        {renderSection('🎌', 'Animes', animes)}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0C14',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0C14',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    color: '#E50914',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  searchIcon: {
    padding: 4,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#1A1F2E',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
  },
  bannerDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#E50914',
    width: 18,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ratingPillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  watchBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
  },
  watchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  listPad: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 8,
  },
  loadingText: {
    color: '#8892AA',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#8892AA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
