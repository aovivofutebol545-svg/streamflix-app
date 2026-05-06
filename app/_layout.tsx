import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/colors';
import { useFavoritesStore } from '../store/favorites';
import { DonationModal, DonationButton } from '../components/DonationModal';

const DONATION_POPUP_KEY = '@streamflix:donation_shown';
const DONATION_INTERVAL_DAYS = 3; // mostra a cada 3 dias

export default function RootLayout() {
  const { loadFavorites } = useFavoritesStore();
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    loadFavorites();
    checkDonationPopup();
  }, []);

  const checkDonationPopup = async () => {
    try {
      const lastShown = await AsyncStorage.getItem(DONATION_POPUP_KEY);
      if (!lastShown) {
        // primeira vez — mostra após 3 segundos
        setTimeout(() => setShowDonation(true), 3000);
        return;
      }
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSince >= DONATION_INTERVAL_DAYS) {
        setTimeout(() => setShowDonation(true), 3000);
      }
    } catch {}
  };

  const handleCloseDonation = async () => {
    setShowDonation(false);
    try {
      await AsyncStorage.setItem(DONATION_POPUP_KEY, Date.now().toString());
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
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

      {/* Botão flutuante de doação */}
      <DonationButton onPress={() => setShowDonation(true)} />

      {/* Modal de doação */}
      <DonationModal visible={showDonation} onClose={handleCloseDonation} />
    </View>
  );
}
