import React, { useState } from 'react';
import {
  StyleSheet, View, SafeAreaView, Text,
  TouchableOpacity, FlatList, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GENRES } from '../../services/api';

export default function CategoriesScreen() {
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');

  const categories = contentType === 'movie' ? GENRES.movies : GENRES.tv;

  const handleGenre = (genre: { id: number; name: string }) => {
    router.push(
      `/categoria/genero?genre=${genre.id}&type=${contentType}&title=${encodeURIComponent(genre.name)}`
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0C14" />

      <Text style={s.heading}>Categorias</Text>

      {/* Toggle filmes / séries */}
      <View style={s.toggle}>
        <TouchableOpacity
          style={[s.toggleBtn, contentType === 'movie' && s.toggleActive]}
          onPress={() => setContentType('movie')}
        >
          <Text style={[s.toggleTxt, contentType === 'movie' && s.toggleTxtActive]}>🎬 Filmes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, contentType === 'tv' && s.toggleActive]}
          onPress={() => setContentType('tv')}
        >
          <Text style={[s.toggleTxt, contentType === 'tv' && s.toggleTxtActive]}>📺 Séries</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.genreCard} onPress={() => handleGenre(item)} activeOpacity={0.75}>
            <Text style={s.genreEmoji}>{GENRE_EMOJI[item.id] || '🎭'}</Text>
            <Text style={s.genreName}>{item.name}</Text>
            <Text style={s.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const GENRE_EMOJI: Record<number, string> = {
  28: '💥', 12: '🗺️', 16: '🐣', 35: '😂', 80: '🔫',
  99: '📽️', 18: '🎭', 10751: '👨‍👩‍👧', 14: '🧙', 36: '📜',
  27: '👻', 10402: '🎵', 9648: '🔍', 10749: '💕', 878: '🚀',
  10770: '📺', 53: '😱', 10752: '⚔️', 37: '🤠',
  // TV
  10759: '💥', 10762: '🐣', 10763: '📰', 10764: '🎪',
  10765: '🧙', 10766: '💔', 10767: '🎤', 10768: '🎖️',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C14' },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  toggle: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1C2235', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#E50914' },
  toggleTxt: { color: '#8A8FA8', fontWeight: '700', fontSize: 14 },
  toggleTxtActive: { color: '#fff' },

  list: { paddingHorizontal: 12, paddingBottom: 120 },
  row: { gap: 10, marginBottom: 10 },

  genreCard: {
    flex: 1,
    backgroundColor: '#1C2235',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2A3350',
  },
  genreEmoji: { fontSize: 22 },
  genreName: { color: '#E0E0E0', fontWeight: '700', fontSize: 14, flex: 1 },
  arrow: { color: '#E50914', fontWeight: '800', fontSize: 16 },
});
