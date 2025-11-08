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
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';

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

  const BookingCard = ({ booking, index }: { booking: Booking; index: number }) => {
    const checkin = formatarData(booking.check_in);
    const checkout = formatarData(booking.check_out);
    const noites = calcularNoites(booking.check_in, booking.check_out);
    const totalPrice = booking.room.base_price * noites * booking.rooms_booked;

    return (
      <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <VStack className="gap-3">
          <HStack className="items-center justify-between">
            <Text className="font-semibold text-gray-800">Reserva #{index + 1}</Text>
            <Badge className="bg-green-100">
              <Text className="text-green-700 font-semibold text-xs">Confirmada</Text>
            </Badge>
          </HStack>

          <VStack className="gap-1">
            <Text className="text-base text-gray-800 font-bold">
              🏨 {booking.hotel.name}
            </Text>
            <Text className="text-sm text-gray-600">
              📍 {booking.hotel.city} • ⭐ {booking.hotel.stars.toFixed(1)}
            </Text>
            <Text className="text-sm text-gray-600 font-medium mt-2">
              🛏️ {booking.room.name}
            </Text>            
            <Text className="text-sm text-gray-600 font-medium">
              📦 {booking.rooms_booked} {booking.rooms_booked === 1 ? 'quarto' : 'quartos'}
            </Text>
            <Text className="text-sm text-gray-600 font-medium">
              📅 {noites} {noites === 1 ? 'noite' : 'noites'}
            </Text>
            <Text className="text-base text-blue-700 font-bold mt-1">
              💰 R$ {totalPrice.toFixed(2).replace('.', ',')}
            </Text>
          </VStack>

          <Text className="text-blue-700 font-semibold">
            {checkin} → {checkout}
          </Text>

          <HStack className="items-center justify-end pt-2 gap-2">
                       
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500"
              onPress={() =>
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
                })
              }
            >
              <HStack className="items-center gap-2">
                <ButtonText className="text-blue-700 font-semibold text-sm">
                  Ver detalhes
                </ButtonText>
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
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => fetchBookings(true)} 
        />
      }
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
          <Text className="text-gray-600 text-sm mt-1">
            {bookings.length} {bookings.length === 1 ? 'reserva ativa' : 'reservas ativas'}
          </Text>
        </VStack>

        {/* Loading */}
        {loading && (
          <Card className="p-6 bg-white border border-blue-100 rounded-xl">
            <HStack className="items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text className="text-blue-700 font-semibold">Carregando reservas...</Text>
            </HStack>
          </Card>
        )}

        {/* Lista de reservas */}
        {!loading && bookings.length > 0 && (
          <VStack className="gap-4">
            {bookings.map((booking, index) => (
              <BookingCard key={booking.id} booking={booking} index={index} />
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
        {!loading && bookings.length === 0 && (
          <Card className="p-8 bg-gray-50 border border-gray-200 rounded-xl items-center">
            <Ionicons name="bed-outline" size={60} color="#9CA3AF" />
            <VStack className="gap-2 mt-4 items-center">
              <Text className="text-gray-700 font-semibold text-lg">
                Nenhuma reserva ativa
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Você ainda não tem reservas ativas.{'\n'}
                Faça uma nova reserva!
              </Text>
              <Button
                className="mt-4 bg-blue-700 hover:bg-blue-800 px-5 py-2 rounded-lg"
                onPress={() => router.push('/homepage')}
              >
                <ButtonText className="text-white font-semibold">
                  Buscar Hotéis
                </ButtonText>
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}