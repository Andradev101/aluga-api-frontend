// app/myReservations.tsx
import { Badge } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';

interface Reserva {
  id: string;
  room_id: number;
  date_checkin: string;
  date_checkout: string;
  hotel_name: string;
}

export default function MyReservations() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const fetchReservas = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_BASE}/reservas`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: Reserva[] = await res.json();

      const hoje = new Date();
      const ativas = data.filter(r => {
        const checkin = new Date(r.date_checkin);
        const checkout = new Date(r.date_checkout);
        return checkin >= hoje || checkout > hoje;
      });

      setReservas(ativas);
    } catch (err: any) {
      console.error('Erro ao carregar reservas:', err);
      Alert.alert('Erro', 'Não foi possível carregar suas reservas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const formatarData = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const ReservaCard = ({ reserva }: { reserva: Reserva }) => {
    const checkin = formatarData(reserva.date_checkin);
    const checkout = formatarData(reserva.date_checkout);

    return (
      <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <VStack className="gap-3">
          <HStack className="items-center justify-between">
            <Text className="font-semibold text-gray-800">Reserva Ativa</Text>
            <Badge className="bg-green-100">
              <Text className="text-green-700 font-semibold text-xs">Confirmada</Text>
            </Badge>
          </HStack>

          <Text className="text-sm text-gray-600 font-medium">🏨 Hotel {"Exemplo"}</Text>
          <Text className="text-sm text-gray-600 font-medium">🏨 Quarto #{reserva.room_id}</Text>
          <Text className="text-blue-700 font-semibold">{checkin} → {checkout}</Text>

          <HStack className="items-center justify-end pt-2">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500"
              onPress={() =>
                router.push({
                  pathname: '/reservationDetails',
                  params: {
                    reservaId: reserva.id,
                    room_id: reserva.room_id.toString(),
                    date_checkin: reserva.date_checkin,
                    date_checkout: reserva.date_checkout,
                  },
                })
              }
            >
              <HStack className="items-center gap-2">
                <ButtonText className="text-blue-700 font-semibold text-sm">Ver detalhes</ButtonText>
                <Ionicons name="chevron-forward" size={14} color="#1E3A8A" />
              </HStack>
            </Button>
          </HStack>
        </VStack>
      </Card>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchReservas(true)} />}
    >
      <VStack className="p-6 gap-6">

        {/* Header com logo */}
        <VStack className="items-center gap-2">
          <TouchableOpacity onPress={() => router.push('/homepage')}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={{ width: 350, height: 150 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </VStack>

        {/* Título */}
        <VStack className="items-center">
          <Heading size="lg" className="text-blue-800 font-bold">
            Minhas Reservas
          </Heading>
        </VStack>

        {/* Loading */}
        {loading && (
          <Card className="p-6 bg-white border border-blue-100 rounded-xl">
            <HStack className="items-center justify-center gap-3">
              <ActivityIndicator size="large" />
              <Text className="text-blue-700 font-semibold">Carregando reservas...</Text>
            </HStack>
          </Card>
        )}

        {/* Lista de reservas */}
        {!loading && reservas.length > 0 && (
          <VStack className="gap-4">
            {reservas.map(reserva => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}

            {/* Botão Voltar para o início */}
            <Button
              className="mt-4 bg-blue-700 hover:bg-blue-800 px-5 py-3 rounded-lg flex-row items-center justify-center"
              onPress={() => router.push('/homepage')}
            >
              <HStack className="items-center gap-2">
                <Ionicons name="home-outline" size={18} color="white" />
                <ButtonText className="text-white font-semibold text-base">
                  Voltar para o Início
                </ButtonText>
              </HStack>
            </Button>
          </VStack>
        )}

        {/* Estado vazio */}
        {!loading && reservas.length === 0 && (
          <Card className="p-8 bg-gray-50 border border-gray-200 rounded-xl items-center">
            <Ionicons name="bed-outline" size={60} color="#9CA3AF" />
            <VStack className="gap-2 mt-4 items-center">
              <Text className="text-gray-700 font-semibold text-lg">Nenhuma reserva ativa</Text>
              <Text className="text-gray-500 text-sm">Faça uma nova reserva!</Text>
              <Button
                className="mt-4 bg-blue-700 hover:bg-blue-800 px-5 py-2 rounded-lg"
                onPress={() => router.push('/')}
              >
                <ButtonText className="text-white font-semibold">Buscar Hotéis</ButtonText>
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}
