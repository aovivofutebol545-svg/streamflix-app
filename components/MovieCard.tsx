import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { THEME } from '../constants/colors';
import { getImageUrl } from '../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  voteAverage: number;
  onPress: () => void;
}

export function MovieCard({
  id,
  title,
  posterPath,
  voteAverage,
  onPress,
}: MovieCardProps) {
  const imageUrl = getImageUrl(posterPath, 'w342');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/342x513?text=Sem+Capa' }}
          style={styles.poster}
        />
        <View style={styles.ratingBadge}>
          <Text style={styles.rating}>{voteAverage.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginHorizontal: THEME.spacing.md / 2,
    marginBottom: THEME.spacing.lg,
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surface,
    marginBottom: THEME.spacing.sm,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: THEME.spacing.sm,
    right: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: 20,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
  },
  rating: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: '500',
    height: 32,
  },
});
