import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '../../constants/colors';
import { fetchContentDetails, getImageUrl } from '../../services/api';
import { useFavoritesStore } from '../../store/favorites';

const { width } = Dimensions.get('window');

interface Details {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: Array<{ id: number; name: string }>;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  imdb_id: string;
}

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadDetails();
    }
  }, [id]);

  useEffect(() => {
    if (details) {
      setIsCurrentlyFavorite(isFavorite(details.id));
    }
  }, [details, favorites]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const movieDetails = await fetchContentDetails('movie', parseInt(id || '0'));
      if (!movieDetails || !movieDetails.title) {
        const tvDetails = await fetchContentDetails('tv', parseInt(id || '0'));
        setDetails(tvDetails);
      } else {
        setDetails(movieDetails);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (!details) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Não foi possível carregar os detalhes</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = details.title || details.name || 'Sem Título';
  const posterUrl = getImageUrl(details.poster_path, 'w342');
  const backdropUrl = getImageUrl(details.backdrop_path, 'w780');

  const toggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite(details.id);
    } else {
      addFavorite({
        id: details.id,
        title,
        type: 'title' in details ? 'movie' : 'tv',
        poster_path: details.poster_path,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Backdrop */}
        {backdropUrl && (
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
        )}

        <View style={styles.content}>
          {/* Poster + Info */}
          <View style={styles.headerContent}>
            {posterUrl && (
              <Image source={{ uri: posterUrl }} style={styles.poster} />
            )}

            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>

              <Text style={styles.rating}>
                ⭐ {details.vote_average.toFixed(1)}/10
              </Text>

              {details.release_date && (
                <Text style={styles.year}>
                  📅 {new Date(details.release_date).getFullYear()}
                </Text>
              )}

              {details.first_air_date && (
                <Text style={styles.year}>
                  📅 {new Date(details.first_air_date).getFullYear()}
                </Text>
              )}

              {details.runtime && (
                <Text style={styles.duration}>⏱️ {details.runtime} min</Text>
              )}

              {details.number_of_seasons && (
                <Text style={styles.duration}>
                  📺 {details.number_of_seasons} temporada(s)
                </Text>
              )}
            </View>
          </View>

          {/* Genres */}
          {details.genres && details.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {details.genres.slice(0, 4).map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Overview */}
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.overview}>{details.overview || 'Sem descrição disponível'}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push(`/player/${details.id}`)}
            >
              <Text style={styles.playButtonText}>▶ Assistir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isCurrentlyFavorite && styles.favoriteButtonActive,
              ]}
              onPress={toggleFavorite}
            >
              <Text style={styles.favoriteButtonText}>
                {isCurrentlyFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  backButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    zIndex: 10,
  },
  backButtonText: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    width: width,
    height: 200,
    backgroundColor: THEME.colors.surface,
  },
  content: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
  },
  title: {
    color: THEME.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: THEME.spacing.sm,
  },
  rating: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: THEME.spacing.xs,
  },
  year: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: THEME.spacing.xs,
  },
  duration: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  genreTag: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  genreText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: THEME.spacing.sm,
  },
  overview: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  playButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  playButtonText: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  favoriteButtonText: {
    fontSize: 20,
  },
  errorText: {
    color: THEME.colors.text,
    fontSize: 16,
  },
});
