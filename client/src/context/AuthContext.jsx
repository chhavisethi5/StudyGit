import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSessionUser, loginUser, registerUser, logoutUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from HTTP-only cookie on application boot
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSessionUser();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 or network error on boot means unauthenticated guest session
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshSession: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
