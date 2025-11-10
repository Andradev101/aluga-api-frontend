import React, { createContext, ReactNode, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean | null;
  userData: any;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  userData: null,
  loading: true,
  logout: () => {},
  refreshUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, userData, loading, logout, refreshUser } = useAuth();
  console.log("AuthContext", userData)
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userData, loading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
