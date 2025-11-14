import { ManageUsers } from '@/components/manageUsers';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

export default function Admin() {
  const { fetchUserData } = useAuth();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
      const fetchAndCall = async () => {
        setLoaded(false)
        try {
          await fetchUserData();
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoaded(true)
        }
      };
  
      fetchAndCall();
    }, [fetchUserData]);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack className="p-2 gap-6">
        {loaded && <ManageUsers/>}
      </VStack>
    </ScrollView>
  );
}
