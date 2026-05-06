import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0D0F18',
          borderTopColor: '#1E2436',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#8892AA',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <Icon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="busca"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ focused }) => <Icon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{
          title: 'Gêneros',
          tabBarIcon: ({ focused }) => <Icon emoji="🎭" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused }) => <Icon emoji="❤️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
