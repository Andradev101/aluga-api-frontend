import ModalComponent from '@/components/modal';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';

interface User {
  id: string;
  userName: string;
  role: string;
  birthDate: string;
  emailAddress: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  address: string;
}

export default function Self() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const { fetchUserData } = useAuth();
    useEffect(() => {
      setIsLoading(true)
      const fetchAndCall = async () => {
        try {
          await fetchUserData();
          let res = await performUserSelfInfoCallout();
          let resBody = await res.json()
          setUser(resBody)
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndCall();
    }, []);
 
  return (
    <>
      {isLoading && <ButtonSpinner color="gray" />}
      <ScrollView className="flex-1 bg-gray-50">
        <VStack className="p-2 gap-2">
          {!isLoading &&
            <Card size="lg" variant="outline" className="m-1">
              <Heading size="4xl" className="mb-1 p-2j">
                Welcome, {user?.firstName} {user?.lastName}!
              </Heading>
              <Divider></Divider>
              <Text size="lg" className="p-2">Here you can manage your:</Text>
              
              <VStack className="gap-2">
                {user && (
                  <Button variant="solid" size="md" action="primary">
                    <ModalComponent content={user} buttonName="Personal information" variant="self" />
                  </Button>
                )}
                <Button variant="solid" size="md" action="primary">
                  <ButtonText>Payment information</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary">
                  <ButtonText>Bookings</ButtonText>
                </Button>
                <Button variant="solid" size="md" action="primary">
                  <ButtonText>Reviews</ButtonText>
                </Button>
              </VStack>
            </Card>
          }
        </VStack>
      </ScrollView>
    </>
  );
}

async function performUserSelfInfoCallout() {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/users/me`;
  
  const options = {
    method: 'GET',
    credentials: 'include' as RequestCredentials,
    headers: {'content-type': 'application/json'},
  };
  let response = await fetch(url, options);
  return response
}