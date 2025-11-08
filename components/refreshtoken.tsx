
import * as Storage from '@/components/secureStorage';
import { Button, ButtonText } from '@/components/ui/button';
import React from 'react';

export default function RefreshToken() {
  
  async function performRefreshToken() {
    await performRefreshTokenCallout();
  }

  async function performRefreshTokenCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/refresh`;
    
    const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(response);
      console.log(data);
      if(response.ok){
        await Storage.save("is_logged_in", "true");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (     
    <Button variant="solid" size="md" action="primary">
      <ButtonText onPress={performRefreshToken}>Refresh token</ButtonText>
    </Button>  
  );
}
