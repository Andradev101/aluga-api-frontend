import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { UserNav } from "@/components/userNav";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { isAuthenticated, loading, userData, logout, fetchUserData } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading || isAuthenticated === null) {
    return (
      <SafeAreaProvider>
        <SafeAreaView edges={["top"]} style={styles.container}>
          <Center>
            <Spinner size="large" color="grey" />;
          </Center>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!isAuthenticated) {
    // Don't render anything while redirecting
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <UserNav userData={userData} logout={logout} />
        <Stack />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
