import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Text,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { THEME } from '../../constants/colors';
import { useFavoritesStore } from '../../store/favorites';
import { MovieCard } from '../../components/MovieCard';
import { useCallback } from 'react';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites } = useFavoritesStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>❤️ Nenhum favorito ainda</Text>
          <Text style={styles.emptySubText}>Marque seus favoritos para vê-los aqui</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Meus Favoritos</Text>
          <FlatList
            data={favorites}
            key={refreshing ? 'refresh' : 'normal'}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MovieCard
                id={item.id}
                title={item.title}
                posterPath={item.poster_path}
                voteAverage={0}
                onPress={() => router.push(`/details/${item.id}`)}
              />
            )}
          />
        </>
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
  title: {
    color: THEME.colors.text,
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  emptyText: {
    color: THEME.colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: THEME.spacing.md,
  },
  emptySubText: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.sm,
    paddingBottom: THEME.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
});
