import { Login } from '@/components/login';
import { VStack } from '@/components/ui/vstack';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
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
        
        {/* Login Form */}
        <VStack className="items-center">
          <Login/>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
