import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

export async function remove(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error("Error removing data:", error);
  }
}

