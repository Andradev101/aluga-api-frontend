import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedLayout() {
  const { isAuthenticated, loading, userData } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    // not logged in → redirect to login
    return <Redirect href="/" />;
  }

  // logged in → allow access to protected routes
  console.log("intercepted by the layout guard")
  return <Stack />;
}
