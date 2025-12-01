import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from "@/hooks/useAuth";
import { Stack, router } from "expo-router";
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Feather } from '@expo/vector-icons';

const BackIcon = () => <Feather name="arrow-left" size={24} color="black" />;


export default function ProtectedLayout() {
  const { isAuthenticated, loading, userData, logout, fetchUserData } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading || isAuthenticated === null) {
    return (
      <SafeAreaProvider>
        <SafeAreaView edges={["top"]} style={styles.container}>
          <Center style={styles.center}>
            <Spinner size="large" color="grey" />
          </Center>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="authrouteexample" options={{ headerShown: false }} />
          <Stack.Screen name="homepage" options={{ headerShown: false }} />

          <Stack.Screen
            name="hotels/create-hotel"
            options={{ headerShown: false, title: '' }}
          />

          <Stack.Screen
            name="hotels/[hotelId]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerTransparent: true,
              headerTintColor: '#000',
              headerBackTitle: '',

              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.headerButtonContainer}
                >
                  <BackIcon />
                </TouchableOpacity>
              ),
              headerRight: () => null,
            }}
          />

        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -6,
    marginTop: 15,
  },
});