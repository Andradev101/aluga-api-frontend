import { Signup } from '@/components/signup';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';

export default function SignupScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <VStack className="p-6 gap-6">        
        {/* Signup Form */}
        <VStack className="items-center">
          <Signup/>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
