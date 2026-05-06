import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { THEME } from '../constants/colors';
import { useFavoritesStore } from '../store/favorites';

export default function RootLayout() {
  const { loadFavorites } = useFavoritesStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: THEME.colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="details/[id]" />
      <Stack.Screen name="player/[id]" />
    </Stack>
  );
}
