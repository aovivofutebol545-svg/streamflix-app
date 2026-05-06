import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '../store/favorites';
import { getImageUrl } from '../services/api';

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
];

export function GenreWidget() {
  const router = useRouter();

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>🎯 Gêneros</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.genreList}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={s.genreChip}
            onPress={() => router.push(`/(tabs)/categorias?genre=${g.id}&type=${g.type}&name=${g.name}`)}
            activeOpacity={0.75}
          >
            <Text style={s.genreEmoji}>{g.emoji}</Text>
            <Text style={s.genreName}>{g.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function FavoritesWidget() {
  const router = useRouter();
  const { favorites } = useFavoritesStore();

  if (!favorites || favorites.length === 0) return null;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>❤️ Meus Favoritos</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/favoritos')}>
          <Text style={s.seeAll}>Ver tudo</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.favList}>
        {favorites.slice(0, 8).map((fav: any) => {
          const imgUrl = getImageUrl(fav.poster_path, 'w185');
          return (
            <TouchableOpacity
              key={fav.id}
              style={s.favItem}
              onPress={() => router.push(`/details/${fav.id}`)}
              activeOpacity={0.8}
            >
              <View style={s.favPoster}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={s.favImgPlaceholder}>🎬</Text>
                )}
                <View style={s.favHeart}>
                  <Text style={{ fontSize: 10 }}>❤️</Text>
                </View>
              </View>
              <Text style={s.favTitle} numberOfLines={2}>{fav.title}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Botão ver todos */}
        <TouchableOpacity
          style={s.favSeeAll}
          onPress={() => router.push('/(tabs)/favoritos')}
          activeOpacity={0.8}
        >
          <Text style={s.favSeeAllText}>Ver{'\n'}todos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export function QuickSearchWidget() {
  const router = useRouter();
  const QUICK = [
    { label: 'Lançamentos', emoji: '🆕', query: 'lançamentos 2024' },
    { label: 'Top Filmes', emoji: '🏆', query: 'melhores filmes' },
    { label: 'Séries', emoji: '📺', query: 'séries populares' },
    { label: 'Doramas', emoji: '🌸', query: 'doramas coreanos' },
    { label: 'Animes', emoji: '🎌', query: 'animes' },
    { label: 'BLs', emoji: '🏳️‍🌈', query: 'bl boys love' },
  ];

  return (
    <View style={s.quickSection}>
      {QUICK.map((q) => (
        <TouchableOpacity
          key={q.label}
          style={s.quickItem}
          onPress={() => router.push(`/(tabs)/busca?q=${encodeURIComponent(q.query)}`)}
          activeOpacity={0.8}
        >
          <Text style={s.quickEmoji}>{q.emoji}</Text>
          <Text style={s.quickLabel}>{q.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    marginBottom: 4,
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
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  seeAll: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  // Gêneros
  genreList: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 4,
    gap: 8,
  },
  genreChip: {
    backgroundColor: '#1C2235',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
    minWidth: 80,
  },
  genreEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  genreName: {
    color: '#C8CEDF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Favoritos
  favList: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 4,
    gap: 10,
  },
  favItem: {
    width: 80,
  },
  favPoster: {
    width: 80,
    height: 112,
    borderRadius: 10,
    backgroundColor: '#1C2235',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  favImgWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favImgPlaceholder: {
    fontSize: 28,
  },
  favHeart: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 2,
  },
  favTitle: {
    color: '#9BA3BF',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
  favSeeAll: {
    width: 80,
    height: 112,
    borderRadius: 10,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  favSeeAllText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Quick search
  quickSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2235',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  quickEmoji: {
    fontSize: 15,
  },
  quickLabel: {
    color: '#C8CEDF',
    fontSize: 12,
    fontWeight: '600',
  },
});
