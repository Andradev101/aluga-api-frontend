import GetSelfInfo from '@/components/getselfinfo';
import Logout from '@/components/logout';
import RefreshToken from '@/components/refreshtoken';
import * as Storage from '@/components/secureStorage';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { LinkText } from '@/components/ui/link';
import { VStack } from '@/components/ui/vstack';
import { Link as RouterLink, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [userRole, setUserRole] = React.useState('');
  
  async function getCredentials() {
    let result = await Storage.getValueFor("user_role");
    setUserRole(result != null? result : '');
    console.log(result);
    console.log("it runned");
  }

  useFocusEffect(
    useCallback(() => {
      getCredentials()
    }, [])
  );

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
          
          {userRole === "sysAdmin" &&
            <RouterLink href="/users">
              <LinkText size="lg">Users (admin only)</LinkText>
            </RouterLink>}
          <HStack>
            <GetSelfInfo/>
            <RefreshToken/>
            <Logout/>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
