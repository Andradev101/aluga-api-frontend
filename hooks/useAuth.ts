import * as Storage from '@/components/secureStorage';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {

      try {
        // const localAuth = await Storage.getValueFor('is_logged_in');
        // if (localAuth) setIsAuthenticated(true);
        
        let credentialsRes = await performCredentialsCallout()
        if(credentialsRes.ok){
          let res = await credentialsRes.json()
          setUserData(res)
          await Storage.save('is_logged_in', "true");
          await Storage.save('user_role', res.token_content.role);
        } else {
          console.log(await credentialsRes.json())
          let refreshTokenRes = await performRefreshToken()
          if(refreshTokenRes.ok) {
            let credentialsRes = await performCredentialsCallout()
            if(credentialsRes.ok){
              let res = await credentialsRes.json()
              setUserData(res)
              await Storage.save('is_logged_in', "true");
              await Storage.save('user_role', res.token_content.role);
            }
          } else {
            await Storage.remove('is_logged_in');
            await Storage.remove('user_role');
          }
        }

      } catch (err) {
        console.error('Auth check failed', err);
        setIsAuthenticated(false);
        await Storage.remove('is_logged_in');
        await Storage.remove('user_role');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  console.log('useAuth hook', isAuthenticated);
  return { isAuthenticated, loading, userData };
}

async function performRefreshToken() {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/refresh`
  
  const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
    };
  const response = await fetch(url,options);
  return response
}

async function performCredentialsCallout() {
const url = `${process.env.EXPO_PUBLIC_API_URL}/credentials`
  const response = await fetch(url, {
    credentials: 'include',
  });
  return response
}