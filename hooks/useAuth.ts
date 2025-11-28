import { router } from "expo-router";
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      console.log("userData updated:", userData);
    }, [userData]);

  const fetchUserData = useCallback(async () => {
    console.log("fetching user")
    setLoading(true);
    try {
      const credentialsRes = await performCredentialsCallout();

      if (credentialsRes.ok) {
        console.log("valid credentials")
        const res = await credentialsRes.json();
        setUserData(res);
        console.log(res);
        setIsAuthenticated(true);
      } else {
        // Try refresh token
        const refreshRes = await performRefreshToken();
        if (refreshRes.ok) {
          console.log("token refreshed")
          const newCredRes = await performCredentialsCallout();
          if (newCredRes.ok) {
            console.log("after refresh credentials")
            const res = await newCredRes.json();
            setUserData(res);
            setIsAuthenticated(true);
          } else {
            console.log("after refresh credentials fail")
            setUserData(null);
            setIsAuthenticated(false);
            router.push("/")
          }
        } else {
          console.log("token refresh failed")
          setUserData(null);
          setIsAuthenticated(false);
          router.push("/")
        }
      }
    } catch (err) {
      console.error('Auth check failed', err);
      setUserData(null);
      setIsAuthenticated(false);
      router.push("/")
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { ok, response } = await performLoginCallout(username, password);
    if(!ok) return {ok, response};
    
    const credentialsRes = await performCredentialsCallout();
    if (credentialsRes.ok) {
      const res = await credentialsRes.json();
      setUserData(res);
      setIsAuthenticated(true);
    }
    return {ok, response};
  }, []);

  const logout = useCallback(async () => {
    // optionally call backend logout endpoint here
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    setIsAuthenticated(false);
    setUserData(null);
    router.push("/")
  }, []);

  const refreshUser = useCallback(async () => {
    console.log("refreshing user data")
    await fetchUserData();
  }, [fetchUserData]);
  // console.log(isAuthenticated, userData, loading)
  return { isAuthenticated, userData, loading, fetchUserData, refreshUser, logout, login };
}

async function performRefreshToken() {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/refresh`;
  return fetch(url, { method: 'POST', credentials: 'include' });
}

async function performCredentialsCallout() {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/credentials`;
  return fetch(url, { method: 'GET', credentials: 'include' });
}

async function performLoginCallout(username: string, password: string) {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/login`;
    
    const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({userName: username, password: password})
    };
    let response = await fetch(url, options);
    return {ok: response.ok, response: response}
  }
