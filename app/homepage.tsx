
import GetSelfInfo from '@/components/getselfinfo';
import Logout from '@/components/logout';
import RefreshToken from '@/components/refreshtoken';
import * as Storage from '@/components/secureStorage';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { LinkText } from '@/components/ui/link';
import { VStack } from '@/components/ui/vstack';
import { Link as RouterLink, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Text } from 'react-native';

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
    <Center className="flex-1">
      <VStack>
        <Text>Homepage auth</Text>      
        {userRole === "sysAdmin" &&
          <RouterLink href="/users">
            <LinkText size="lg">Users (admin only)</LinkText>
          </RouterLink>}
        <HStack>
          <GetSelfInfo/>
          <RefreshToken/>
           <Logout/>
          {/* <Button variant="solid" size="md" action="primary">
            <ButtonText>Get credentials</ButtonText>
          </Button> */}
        </HStack>
      </VStack>
    </Center>
  );
}
