// app/myReservations.tsx
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';

interface Hotel {
  id: number;
  name: string;
  city: string;
  stars: number;
}

interface Room {
  id: number;
  name: string;
  room_type: string;
  base_price: number;
}

interface Booking {
  id: number;
  user_id: string;
  hotel_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  rooms_booked: number;
  hotel: Hotel;
  room: Room;
}

export default function MyReservations() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_BASE}/bookings/`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert('Sessão expirada', 'Faça login novamente.');
          router.push('/login');
          return;
        }
        throw new Error(`Erro ${res.status}`);
      }
      
      const data: Booking[] = await res.json();

      // Filtrar apenas reservas ativas (futuras ou em andamento)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const ativas = data.filter(b => {
        const checkout = new Date(b.check_out);
        checkout.setHours(0, 0, 0, 0);
        return checkout >= hoje;
      });

      setBookings(ativas);
    } catch (err: any) {
      console.error('Erro ao carregar reservas:', err);
      Alert.alert('Erro', 'Não foi possível carregar suas reservas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatarData = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calcularNoites = (checkin: string, checkout: string) => {
    const inicio = new Date(checkin);
    const fim = new Date(checkout);
    const diff = fim.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleVerDetalhes = (booking: Booking) => {
    router.push({
      pathname: '/reservationDetails',
      params: {
        reservaId: booking.id.toString(),
        roomName: booking.room?.name,
        roomType: booking.room?.room_type,
        roomPrice: booking.room?.base_price?.toString(),
        hotelName: booking.hotel?.name,
        hotelCity: booking.hotel?.city,
        hotelStars: booking.hotel?.stars?.toString(),
        date_checkin: booking.check_in,
        date_checkout: booking.check_out,
        rooms_booked: booking.rooms_booked.toString(),
      },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => fetchBookings(true)} 
        />
      }
    >
      <VStack className="p-2 gap-2">
        <Card size="lg" variant="outline" className="m-1">
          <Heading size="4xl" className="mb-1 p-2">
            Minhas Reservas
          </Heading>
          <Divider />
          <Text size="lg" className="p-2">
            Você tem {bookings.length} {bookings.length === 1 ? 'reserva ativa' : 'reservas ativas'}
          </Text>

          {/* Loading */}
          {loading && (
            <VStack className="items-center justify-center p-6 gap-3">
              <ButtonSpinner color="gray" />
              <Text className="text-blue-700 font-semibold">Carregando reservas...</Text>
            </VStack>
          )}

          {/* Lista de reservas */}
          {!loading && bookings.length > 0 && (
            <VStack className="gap-3 p-2">
              {bookings.map((booking, index) => {
                const checkin = formatarData(booking.check_in);
                const checkout = formatarData(booking.check_out);
                const noites = calcularNoites(booking.check_in, booking.check_out);
                const totalPrice = booking.room.base_price * noites * booking.rooms_booked;

                return (
                  <View
                    key={booking.id}
                    className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
                  >
                    {/* Informações da reserva */}
                    <View className="mb-3">
                      <Text className="text-gray-900 font-bold text-lg mb-1">
                        🏨 {booking.hotel.name}
                      </Text>
                      <Text className="text-gray-700 text-sm mb-2">
                        📍 {booking.hotel.city} • ⭐ {booking.hotel.stars.toFixed(1)}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-1">
                        🛏️ {booking.room.name} ({booking.room.room_type})
                      </Text>
                      <Text className="text-gray-600 text-sm mb-1">
                        📅 {checkin} → {checkout} • {noites} {noites === 1 ? 'noite' : 'noites'}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-2">
                        📦 {booking.rooms_booked} {booking.rooms_booked === 1 ? 'quarto' : 'quartos'}
                      </Text>
                      <Text className="text-blue-700 font-bold text-lg">
                        💰 R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>

                    {/* Botão Ver detalhes */}
                    <Button
                      variant="solid"
                      size="sm"
                      action="primary"
                      onPress={() => handleVerDetalhes(booking)}
                      className="w-full"
                    >
                      <ButtonText>Ver detalhes</ButtonText>
                    </Button>
                  </View>
                );
              })}
            </VStack>
          )}

          {/* Estado vazio */}
          {!loading && bookings.length === 0 && (
            <VStack className="items-center p-8 gap-4">
              <Ionicons name="bed-outline" size={60} color="#9CA3AF" />
              <Text className="text-gray-700 font-semibold text-lg">
                Nenhuma reserva ativa
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Você ainda não tem reservas ativas.{'\n'}
                Faça uma nova reserva!
              </Text>
              <Button
                variant="solid"
                size="md"
                action="primary"
                onPress={() => router.push('/explorer')}
              >
                <ButtonText>Buscar Hotéis</ButtonText>
              </Button>
            </VStack>
          )}

          {/* Botão de voltar */}
          {bookings.length > 0 && (
            <>
              <Divider className="mt-4" />
              <Button
                variant="outline"
                size="md"
                className="m-2"
                onPress={() => router.push('/explorer')}
              >
                <ButtonText>Voltar para o Início</ButtonText>
              </Button>
            </>
          )}
        </Card>
      </VStack>
    </ScrollView>
  );
}