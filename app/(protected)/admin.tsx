import { ManageUsers } from '@/components/manageUsers';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';

export default function Admin() {
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
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="p-2 gap-6">
        <ManageUsers/>
      </VStack>
    </ScrollView>
  );
}
