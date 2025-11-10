import { ManageUsers } from '@/components/manageUsers';
import { VStack } from '@/components/ui/vstack';
import { useAuthContext } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';

export default function Admin() {
  const { isAuthenticated, userData, loading } = useAuthContext();
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
    }, [isAuthenticated, userData, loading]);
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="p-6 gap-6">
        <ManageUsers/>
      </VStack>
    </ScrollView>
  );
}
