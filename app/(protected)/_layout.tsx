import { UserNav } from "@/components/userNav";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { isAuthenticated, loading, userData, logout, fetchUserData } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading || isAuthenticated === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
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
