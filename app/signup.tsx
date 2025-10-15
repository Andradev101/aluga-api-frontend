
import { Signup } from '@/components/signup';
import { Center } from '@/components/ui/center';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView>
      <Center className="flex-1">
        <Signup/>
      </Center>
    </ScrollView>
  );
}
