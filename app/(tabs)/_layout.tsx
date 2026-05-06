import React from 'react';
import { Tabs } from 'expo-router';
import { THEME } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: THEME.colors.secondary,
          borderTopColor: THEME.colors.border,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="busca"
        options={{
          title: 'Buscar',
          tabBarLabel: 'Buscar',
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{
          title: 'Gêneros',
          tabBarLabel: 'Gêneros',
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
        }}
      />
    </Tabs>
  );
}
