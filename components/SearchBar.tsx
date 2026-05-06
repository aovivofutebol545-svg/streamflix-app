import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/colors';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = 'Buscar filmes, séries...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={THEME.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    color: THEME.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});
