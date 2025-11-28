import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, TouchableOpacity } from 'react-native';


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
        </VStack>

      </VStack>
    </ScrollView>
  );
}