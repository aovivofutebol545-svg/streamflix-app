import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { getImageUrl } from '../services/api';

const CARD_WIDTH = 120;
const CARD_HEIGHT = 178;

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  voteAverage: number;
  onPress: () => void;
}

export function MovieCard({ title, posterPath, voteAverage, onPress }: MovieCardProps) {
  const imageUrl = getImageUrl(posterPath, 'w342');
  const rating = voteAverage ? voteAverage.toFixed(1) : '?';
  const ratingColor = voteAverage >= 7 ? '#22C55E' : voteAverage >= 5 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.posterWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Text style={styles.placeholderText}>🎬</Text>
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: ratingColor }]}>
          <Text style={styles.badgeText}>{rating}</Text>
        </View>
        {/* Gradient bottom */}
        <View style={styles.gradient} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 10,
  },
  posterWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1F2E',
    marginBottom: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    color: '#C8CEDF',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
});
