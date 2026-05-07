import React, { useEffect, useState } from 'react';
import { Stack, useSegments } from 'expo-router';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavoritesStore } from '../store/favorites';
import { DonationModal, DonationButton } from '../components/DonationModal';

const DONATION_KEY = '@streamflix:donation_shown';

export default function RootLayout() {
  const { loadFavorites } = useFavoritesStore();
  const [showDonation, setShowDonation] = useState(false);
  const segments = useSegments();

  // Não mostra botão de doação no player
  const isPlayer = segments.includes('player');

  useEffect(() => {
    loadFavorites();
    checkDonation();
  }, []);

  const checkDonation = async () => {
    try {
      const last = await AsyncStorage.getItem(DONATION_KEY);
      if (!last) {
        setTimeout(() => setShowDonation(true), 4000);
      } else {
        const days = (Date.now() - parseInt(last)) / 86400000;
        if (days >= 3) setTimeout(() => setShowDonation(true), 4000);
      }
    } catch {}
  };

  const handleClose = async () => {
    setShowDonation(false);
    try { await AsyncStorage.setItem(DONATION_KEY, Date.now().toString()); } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0C14' }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0C14' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="details/[id]" />
        <Stack.Screen name="player/[id]" />
        <Stack.Screen name="categoria/[slug]" />
        <Stack.Screen name="categoria/genero" />
      </Stack>

      {/* Só mostra fora do player */}
      {!isPlayer && <DonationButton onPress={() => setShowDonation(true)} />}
      <DonationModal visible={showDonation} onClose={handleClose} />
    </View>
  );
}
