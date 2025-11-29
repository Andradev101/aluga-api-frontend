// app/confirmacao.tsx
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

// FUNÇÃO AUXILIAR: Converte string YYYY-MM-DD para Date
const localISOStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export default function Confirmacao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { hotelName, hotelId, roomName, roomId, total, checkin, checkout } = params;

  const formatarData = (iso: string | undefined) => {
    if (!iso) return 'N/A';
    const date = localISOStringToDate(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="flex-1 items-center justify-center p-6 gap-6">
        {/* Ícone de sucesso */}
        <View className="items-center justify-center bg-green-100 rounded-full w-32 h-32">
          <Ionicons name="checkmark-circle" size={90} color="#16A34A" />
        </View>

        {/* Título e subtítulo */}
        <VStack className="items-center gap-2">
          <Heading size="4xl" className="text-green-600 text-center">
            Reserva Confirmada!
          </Heading>
          <Text className="text-gray-600 text-center text-base">
            Sua reserva foi processada com sucesso.{'\n'}
            Você receberá um e-mail de confirmação em breve.
          </Text>
        </VStack>

        {/* Card com detalhes */}
        <Card size="lg" variant="outline" className="w-full">
          <VStack className="p-4 gap-3">
            <Heading size="xl" className="text-blue-700 mb-2">
              Detalhes da Reserva
            </Heading>

            <Divider />

            {/* Hotel */}
            <VStack className="gap-1">
              <Text className="text-gray-500 text-sm">Hotel</Text>
              <Text className="text-gray-900 font-semibold text-base">
                🏨 {hotelName}
              </Text>
            </VStack>

            <Divider />

            {/* Quarto */}
            <VStack className="gap-1">
              <Text className="text-gray-500 text-sm">Quarto</Text>
              <Text className="text-gray-900 font-semibold text-base">
                🛏️ {roomName}
              </Text>
            </VStack>

            <Divider />

            {/* Datas */}
            <VStack className="gap-2">
              <Text className="text-gray-500 text-sm">Período</Text>
              <HStack className="items-center gap-2">
                <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                <VStack className="flex-1">
                  <Text className="text-gray-900 font-medium text-sm">
                    Check-in
                  </Text>
                  <Text className="text-gray-700 text-sm">
                    {formatarData(checkin as string)}
                  </Text>
                </VStack>
              </HStack>
              <HStack className="items-center gap-2">
                <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                <VStack className="flex-1">
                  <Text className="text-gray-900 font-medium text-sm">
                    Check-out
                  </Text>
                  <Text className="text-gray-700 text-sm">
                    {formatarData(checkout as string)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Divider />

            {/* Total */}
            <VStack className="gap-1 bg-green-50 p-3 rounded-lg">
              <Text className="text-gray-500 text-sm">Valor Total</Text>
              <Text className="text-green-700 font-bold text-2xl">
                💰 R$ {total}
              </Text>
            </VStack>
          </VStack>
        </Card>

        {/* Botões de ação */}
        <VStack className="w-full gap-3 mt-4">
          <Button
            variant="solid"
            size="lg"
            action="primary"
            onPress={() => router.push('/myReservations')}
            className="w-full"
          >
            <HStack className="items-center gap-2">
              <Ionicons name="list-outline" size={20} color="white" />
              <ButtonText>Ver Minhas Reservas</ButtonText>
            </HStack>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push('/explorer')}
            className="w-full"
          >
            <HStack className="items-center gap-2">
              <Ionicons name="home-outline" size={20} color="#1E3A8A" />
              <ButtonText>Voltar ao Início</ButtonText>
            </HStack>
          </Button>
        </VStack>

        {/* Mensagem adicional */}
        <View className="items-center mt-4">
          <Text className="text-gray-500 text-sm text-center">
            Dúvidas? Entre em contato conosco.
          </Text>
        </View>
      </VStack>
    </ScrollView>
  );
}