import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/colors';
import { searchContent, Content } from '../../services/api';
import { SearchBar } from '../../components/SearchBar';
import { MovieCard } from '../../components/MovieCard';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);
      const data = await searchContent(query, 'multi');
      const filtered = data.filter(
        (item) => 'title' in item || 'name' in item
      ) as Content[];
      setResults(filtered);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="Buscar filmes, séries, doramas..."
        value={query}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhum resultado encontrado para "{query}"</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
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
      )}

      {!searched && query.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.suggestText}>🔍 Digite para buscar filmes, séries e mais</Text>
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
    paddingHorizontal: THEME.spacing.md,
  },
  searchBar: {
    marginBottom: THEME.spacing.md,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.sm,
    paddingBottom: THEME.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  suggestText: {
    color: THEME.colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
});
