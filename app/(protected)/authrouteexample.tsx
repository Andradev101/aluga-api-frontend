import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/useAuth';
import React, { useEffect } from 'react';

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
  
  const { fetchUserData } = useAuth();
    useEffect(() => {
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
    <>
      <Text size="lg" className="p-2">only logged in members</Text>
    </>
  );
}