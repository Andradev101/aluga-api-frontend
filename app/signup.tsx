import { Signup } from '@/components/signup';
import { VStack } from '@/components/ui/vstack';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function SignupScreen() {
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
        
        {/* Signup Form */}
        <VStack className="items-center">
          <Signup/>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
