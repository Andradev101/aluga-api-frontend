// app/reservationDetails.tsx
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

// FUNÇÃO AUXILIAR: Converte string YYYY-MM-DD para Date (meio-dia local para evitar problemas de timezone)
const localISOStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export default function ReservationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    reservaId,
    hotelName,
    hotelCity,
    hotelStars,
    roomName,
    roomType,
    roomPrice,
    date_checkin,
    date_checkout,
    rooms_booked,
  } = params;

  const formatarData = (iso: string | undefined) => {
    if (!iso) return 'N/A';
    const date = localISOStringToDate(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calcularNoites = (checkin: string | undefined, checkout: string | undefined) => {
    if (!checkin || !checkout) return 0;
    const inicio = localISOStringToDate(checkin);
    const fim = localISOStringToDate(checkout);
    const diff = fim.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const noites = calcularNoites(date_checkin as string, date_checkout as string);
  const pricePerNight = parseFloat(roomPrice as string) || 0;
  const roomsCount = parseInt(rooms_booked as string) || 1;
  const totalPrice = pricePerNight * noites * roomsCount;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="p-2 gap-2">
        {/* Header com botão voltar */}
        <HStack className="items-center p-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.back()}
            className="w-10 h-10 p-0"
          >
            <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
          </Button>
          <Heading size="3xl" className="flex-1">
            Detalhes da Reserva
          </Heading>
        </HStack>

        {/* Card principal */}
        <Card size="lg" variant="outline" className="m-1">
          {/* ID da Reserva e Status */}
          <HStack className="justify-between items-center p-4">
            <VStack>
              <Text className="text-gray-500 text-sm mb-1">ID da Reserva</Text>
              <Text className="text-gray-900 font-bold text-lg">#{reservaId}</Text>
            </VStack>
            <Badge size="lg" variant="solid" action="success">
              <BadgeText>Confirmada</BadgeText>
            </Badge>
          </HStack>

          <Divider />

          {/* Informações do Hotel */}
          <VStack className="p-4 gap-2">
            <Text className="text-gray-500 text-sm">Hotel</Text>
            <Text className="text-gray-900 font-bold text-xl">
              🏨 {hotelName}
            </Text>
            <Text className="text-gray-700 text-base">
              📍 {hotelCity}
            </Text>
            <Text className="text-gray-700 text-base">
              ⭐ {hotelStars} estrelas
            </Text>
          </VStack>

          <Divider />

          {/* Informações do Quarto */}
          <VStack className="p-4 gap-2">
            <Text className="text-gray-500 text-sm">Quarto</Text>
            <Text className="text-gray-900 font-bold text-lg">
              🛏️ {roomName}
            </Text>
            <Text className="text-gray-700 text-base">
              {roomType}
            </Text>
            <Text className="text-gray-700 text-base">
              💵 R$ {pricePerNight.toFixed(2).replace('.', ',')} por noite
            </Text>
          </VStack>

          <Divider />

          {/* Período da Reserva */}
          <VStack className="p-4 gap-2">
            <Text className="text-gray-500 text-sm">Período</Text>
            <HStack className="items-center gap-2">
              <Ionicons name="calendar-outline" size={20} color="#4B5563" />
              <VStack className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Check-in
                </Text>
                <Text className="text-gray-700">
                  {formatarData(date_checkin as string)}
                </Text>
              </VStack>
            </HStack>
            <HStack className="items-center gap-2">
              <Ionicons name="calendar-outline" size={20} color="#4B5563" />
              <VStack className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Check-out
                </Text>
                <Text className="text-gray-700">
                  {formatarData(date_checkout as string)}
                </Text>
              </VStack>
            </HStack>
            <Text className="text-gray-600 text-sm mt-1">
              {noites} {noites === 1 ? 'noite' : 'noites'}
            </Text>
          </VStack>

          <Divider />

          {/* Quantidade de Quartos */}
          <VStack className="p-4 gap-2">
            <Text className="text-gray-500 text-sm">Quartos Reservados</Text>
            <HStack className="items-center gap-2">
              <Ionicons name="key-outline" size={24} color="#4B5563" />
              <Text className="text-gray-900 font-bold text-lg">
                {rooms_booked} {roomsCount === 1 ? 'quarto' : 'quartos'}
              </Text>
            </HStack>
          </VStack>

          <Divider />

          {/* Total */}
          <VStack className="p-4 gap-2 bg-blue-50 rounded-b-lg">
            <Text className="text-gray-500 text-sm">Valor Total</Text>
            <Text className="text-blue-700 font-bold text-2xl">
              💰 R$ {totalPrice.toFixed(2).replace('.', ',')}
            </Text>
            <Text className="text-gray-600 text-xs">
              {roomsCount} {roomsCount === 1 ? 'quarto' : 'quartos'} × {noites} {noites === 1 ? 'noite' : 'noites'}
            </Text>
          </VStack>
        </Card>

        {/* Botões de ação */}
        <VStack className="gap-2 p-2">
          <Button
            variant="solid"
            size="lg"
            action="primary"
            onPress={() => router.push('/myReservations')}
            className="w-full"
          >
            <ButtonText>Voltar às Minhas Reservas</ButtonText>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push('/explorer')}
            className="w-full"
          >
            <ButtonText>Ir para o Início</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}