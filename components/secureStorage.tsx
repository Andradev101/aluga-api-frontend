import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ✅ Salvar valor
export async function save(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// ✅ Obter valor
export async function getValueFor(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      const value = await AsyncStorage.getItem(key);
      return value;
    } else {
      const value = await SecureStore.getItemAsync(key);
      return value;
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}
