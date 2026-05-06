import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/colors';
import { fetchContentByGenre, GENRES, Content } from '../../services/api';
import { MovieCard } from '../../components/MovieCard';
import { CategorySection } from '../../components/CategorySection';

export default function CategoriesScreen() {
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGenre) {
      loadContentByGenre();
    }
  }, [selectedGenre, contentType]);

  const loadContentByGenre = async () => {
    if (!selectedGenre) return;

    try {
      setLoading(true);
      const data = await fetchContentByGenre(contentType, selectedGenre);
      setContent(data);
    } catch (error) {
      console.error('Erro ao buscar por gênero:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = contentType === 'movie' ? GENRES.movies : GENRES.tv;

  return (
    <SafeAreaView style={styles.container}>
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            contentType === 'movie' && styles.typeButtonActive,
          ]}
          onPress={() => {
            setContentType('movie');
            setSelectedGenre(null);
          }}
        >
          <Text
            style={[
              styles.typeButtonText,
              contentType === 'movie' && styles.typeButtonTextActive,
            ]}
          >
            🎬 Filmes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            contentType === 'tv' && styles.typeButtonActive,
          ]}
          onPress={() => {
            setContentType('tv');
            setSelectedGenre(null);
          }}
        >
          <Text
            style={[
              styles.typeButtonText,
              contentType === 'tv' && styles.typeButtonTextActive,
            ]}
          >
            📺 Séries
          </Text>
        </TouchableOpacity>
      </View>

      {/* Genres */}
      <CategorySection
        title="Gêneros"
        categories={categories}
        selectedId={selectedGenre || undefined}
        onSelectCategory={setSelectedGenre}
      />

      {/* Content Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      ) : selectedGenre ? (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.selectText}>👈 Selecione um gênero</Text>
        </View>
      )}
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
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  typeButtonText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: THEME.colors.text,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.sm,
    paddingBottom: THEME.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  selectText: {
    color: THEME.colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
});
