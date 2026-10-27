'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

export type { User };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  demoLogin: () => void;
  updateUser: (data: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr_finora_01',
  name: 'Alex Morgan',
  email: 'alex.morgan@finora.finance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'Personal Pro',
};

const USER_STORAGE_KEY = 'finora_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [isLoading] = useState(false);

  useEffect(() => {
    // 1. First sync from lowdb backend
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // 2. Fall back to local storage
        try {
          const stored = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('pryma_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email && parsed.email.includes('pryma.finance')) {
              parsed.email = parsed.email.replace('pryma.finance', 'finora.finance');
            }
            setUser(parsed);
          }
        } catch {
          // ignore
        }
      });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          // ignore invalid json
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password' };
    }

    const loggedUser: User = {
      ...DEFAULT_USER,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    };

    setUser(loggedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!name || !email || !pass) {
      return { success: false, error: 'All fields are required' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      ...DEFAULT_USER,
      id: `usr_${Date.now()}`,
      name,
      email,
    };

    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('pryma_user');
  };

  const demoLogin = () => {
    setUser(DEFAULT_USER);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
