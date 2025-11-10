import GetSelfInfo from '@/components/getselfinfo';
import Logout from '@/components/logout';
import RefreshToken from '@/components/refreshtoken';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { LinkText } from '@/components/ui/link';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import { router, Link as RouterLink } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native';


export default function HomeScreen() {
  const { userData, fetchUserData } = useAuth();
  useEffect(() => {
      console.log("from homepage:", userData)
      const fetchAndCall = async () => {
        try {
          await fetchUserData();
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
  
      fetchAndCall();
    }, [fetchUserData]);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="p-6 gap-6">
        {/* Header */}
        <VStack className="items-center gap-2">
          <TouchableOpacity onPress={() => router.push('/homepage')}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 350, height: 150 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </VStack>

        {/* Content */}
        <VStack className="items-center gap-4">
          <Text>Homepage auth</Text>

          {/* Navigation Buttons */}
          <Button
            className="bg-aluga-500 hover:bg-aluga-600"
            onPress={() => router.push('/reviews')}
          >
            <ButtonText className="text-white font-semibold">🌟 Ver Avaliações de Hotéis</ButtonText>
          </Button>

          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onPress={() => router.push('/hotels')}
          >
            <ButtonText className="text-white font-semibold">🏨 Ver Catálogo de Hotéis</ButtonText>
          </Button>

          { userData?.token_content?.role === "sysAdmin" &&
             <Button
                className="bg-green-600 hover:bg-green-700" 
                onPress={() => router.push('/hotels/create-hotel')} // Rota para a nova tela
             >
                <ButtonText className="text-white font-semibold">✨ Cadastrar Novo Hotel</ButtonText>
             </Button>
          }

          {/* 🔹 Novo botão para reservas */}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onPress={() => router.push('/criarReserva')}
          >
            <ButtonText className="text-white font-semibold">📅 Fazer Reserva</ButtonText>
          </Button>

          {/* 🔹 Novo botão para ver as reservas */}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onPress={() => router.push('/myReservations')}
          >
            <ButtonText className="text-white font-semibold"> Visualizar Reservas</ButtonText>
          </Button>

          { userData?.token_content?.role === "sysAdmin" &&
            <RouterLink href="/users">
              <LinkText size="lg">Users (admin only)</LinkText>
            </RouterLink>
          }

          <HStack>
            <GetSelfInfo/>
            <RefreshToken/>
            <Logout/>
          </HStack>
          {/* <HotelsScreen/> */}
        </VStack>
      </VStack>
    </ScrollView>
  );
}