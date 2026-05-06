import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/colors';

interface Category {
  id: number;
  name: string;
}

interface CategorySectionProps {
  title: string;
  categories: Category[];
  selectedId?: number;
  onSelectCategory: (id: number) => void;
  style?: ViewStyle;
}

export function CategorySection({
  title,
  categories,
  selectedId,
  onSelectCategory,
  style,
}: CategorySectionProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              selectedId === item.id && styles.chipSelected,
            ]}
            onPress={() => onSelectCategory(item.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedId === item.id && styles.chipTextSelected,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.lg,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: THEME.spacing.md,
    marginLeft: THEME.spacing.md,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  chip: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: THEME.colors.text,
  },
});
