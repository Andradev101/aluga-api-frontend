
import { Button, ButtonText } from '@/components/ui/button';
import React from 'react';

export default function GetSelfInfo() {
  
  async function performGetSelf() {
    await performGetSelfCallout();
  }

  async function performGetSelfCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users/me`;
    
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
      if(!response.ok){
        // setIsLoginError(true)
        // setLoginErrorMsg(data.detail? data.detail : "An unexpected error occurred.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (     
    <Button variant="solid" size="md" action="primary">
      <ButtonText onPress={performGetSelf}>Get self info (users)</ButtonText>
    </Button>  
  );
}
