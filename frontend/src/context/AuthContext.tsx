'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.status === 'success' && res.user) {
        setUser(res.user);
        localStorage.setItem('cover_user', JSON.stringify(res.user));
      }
    } catch {
      // Ignore
    }
  };

  const updateUserBalance = (newBalance: number) => {
    if (user) {
      const updated = { ...user, wallet_balance: newBalance };
      setUser(updated);
      localStorage.setItem('cover_user', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('cover_token');
    const storedUser = localStorage.getItem('cover_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // invalid
      }
      api.getMe()
        .then((res) => {
          if (res.status === 'success' && res.user) {
            setUser(res.user);
            localStorage.setItem('cover_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cover_token', newToken);
    localStorage.setItem('cover_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cover_token');
    localStorage.removeItem('cover_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, updateUserBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
