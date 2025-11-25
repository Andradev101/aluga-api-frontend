import { Alert } from 'react-native';

export const useRefreshTokenAction = () => {

  async function performRefreshToken() {
    await performRefreshTokenCallout();
  }

  async function performRefreshTokenCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/refresh`;

    const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: { 'content-type': 'application/json' },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(response);
      console.log(data);
      Alert.alert("Refresh Token", `Status: ${response.status}\nToken renovado (verifique o console).`, [{ text: "OK" }]);
      if (!response.ok) {
        // setIsLoginError(true)
        // setLoginErrorMsg(data.detail? data.detail : "An unexpected error occurred.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Rede", "Não foi possível conectar à API de refresh.", [{ text: "OK" }]);
    }
  }

  return performRefreshToken;
};

export default function RefreshToken() {
  return null;
}