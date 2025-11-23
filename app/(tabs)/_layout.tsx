// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
// 🚨 Importe o ícone Star para a tela de reviews
import { CalendarCheck, Home, Star, User } from 'lucide-react-native';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Cores do seu projeto Aluga Aí
  const PRIMARY_ORANGE = '#FF7F00';
  const WHITE = '#FFFFFF';

  // Ícone/Label Ativo: Branco (Para fundo Laranja)
  const activeColor = WHITE;
  // Ícone/Label Inativo: Branco com opacidade (Para fundo Laranja)
  const inactiveColor = 'rgba(255, 255, 255, 0.6)';

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 75,
          paddingTop: 5,
          paddingBottom: 5,
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: PRIMARY_ORANGE, // Fundo Laranja
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        }
      }}>

      {/* 1. Hotéis (index.tsx) -> Explorar */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Home size={25} color={color} />,
        }}
      />

      {/* 2. Avaliações (reviews.tsx) -> NOVO POSICIONAMENTO */}
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Avaliações',
          // 🚨 Ícone de estrela apropriado
          tabBarIcon: ({ color }) => <Star size={25} color={color} />,
        }}
      />

      {/* 3. Reservas (myReservations.tsx) -> Viagens/Reservas */}
      <Tabs.Screen
        name="myReservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <CalendarCheck size={25} color={color} />,
        }}
      />

      {/* 4. Perfil (profile.tsx) -> Perfil/Conta */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={25} color={color} />,
        }}
      />
    </Tabs>
  );
}