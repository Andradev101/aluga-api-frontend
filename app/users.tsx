
import { Center } from '@/components/ui/center';
import React from 'react';
import { Button, Text } from 'react-native';

export default function HomeScreen() {
  
const [payloadBody, setpayloadBody] = React.useState('asad');

async function performUsersCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users`;
    
    const options = {
      method: 'GET',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(response);
      console.log(data);
      if(response.ok){
        console.log("OK");
        setpayloadBody(JSON.stringify(data))
      } else {
        // setLoginError(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Center className="flex-1">
      <Button title='callout' onPress={performUsersCallout}></Button>
      <Text>{payloadBody}</Text>
    </Center>
  );
}
