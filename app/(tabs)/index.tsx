import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/colors';
import {
  fetchTrendingContent,
  fetchDoramas,
  fetchAnimes,
  fetchDublados,
  getImageUrl,
  Content,
} from '../../services/api';
import { MovieCard } from '../../components/MovieCard';
import { SearchBar } from '../../components/SearchBar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState<Content[]>([]);
  const [doramas, setDoramas] = useState<Content[]>([]);
  const [animes, setAnimes] = useState<Content[]>([]);
  const [dublados, setDublados] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [trendingData, doramasData, animesData, dubladosData] = await Promise.all([
        fetchTrendingContent('movie'),
        fetchDoramas(),
        fetchAnimes(),
        fetchDublados(),
      ]);
      setTrending(trendingData);
      setDoramas(doramasData);
      setAnimes(animesData);
      setDublados(dubladosData);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBanner = (item: Content) => {
    const imageUrl = getImageUrl(item.backdrop_path, 'w780');
    const title = 'title' in item ? item.title : item.name;
    const voteAverage = item.vote_average || 0;

    return (
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => router.push(`/details/${item.id}`)}
      >
        <Image source={{ uri: imageUrl || '' }} style={styles.banner} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle} numberOfLines={3}>
            {title}
          </Text>
          <View style={styles.bannerFooter}>
            <Text style={styles.bannerRating}>⭐ {voteAverage.toFixed(1)}</Text>
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>▶ Assistir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>STREAMFLIX</Text>
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Buscar filmes e séries..."
          value=""
          onChangeText={() => {}}
          onFocus={() => router.push('/(tabs)/busca')}
        />

        {/* Featured Banner */}
        {trending.length > 0 && renderBanner(trending[0])}

        {/* Em Tendência */}
        <Text style={styles.sectionTitle}>Em Tendência</Text>
        <FlatList
          data={trending.slice(1, 7)}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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

        {/* Doramas */}
        {doramas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🌸 Doramas</Text>
            <FlatList
              data={doramas.slice(0, 6)}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
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
          </>
        )}

        {/* Animes */}
        {animes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🎌 Animes</Text>
            <FlatList
              data={animes.slice(0, 6)}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
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
          </>
        )}

        {/* Dublados PT-BR */}
        {dublados.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🇧🇷 Dublados PT-BR</Text>
            <FlatList
              data={dublados.slice(0, 6)}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.lg,
  },
  logo: {
    color: THEME.colors.primary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sectionTitle: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: THEME.spacing.md,
    marginLeft: THEME.spacing.md,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.sm,
    paddingBottom: THEME.spacing.lg,
  },
  bannerContainer: {
    height: 400,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
  },
  bannerTitle: {
    color: THEME.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: THEME.spacing.md,
  },
  bannerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerRating: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
  },
  playButtonText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
