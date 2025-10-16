
import { Button, ButtonText } from '@/components/ui/button';
import { router } from 'expo-router';
import React from 'react';

export default function Logout() {
  
  async function performLogout() {
    await performLogoutCallout();
    router.push('/');
  }
  async function performLogoutCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/logout`;
    
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
      <ButtonText onPress={performLogout}>Logout</ButtonText>
    </Button>  
  );
}
