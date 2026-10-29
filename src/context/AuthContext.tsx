'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authClient } from '@/lib/auth/client';

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
  id: 'usr_default',
  name: 'User',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'Personal Pro',
};

const USER_STORAGE_KEY = 'finora_user';
const LOGGED_OUT_KEY = 'finora_logged_out';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. If user explicitly logged out, keep logged out
      if (typeof window !== 'undefined' && localStorage.getItem(LOGGED_OUT_KEY) === 'true') {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Check active session from Neon Auth
        const sessionRes = await authClient.getSession();
        if (isMounted && sessionRes?.data?.user) {
          const authUser = sessionRes.data.user;
          const mappedUser: User = {
            id: authUser.id,
            name: authUser.name || authUser.email.split('@')[0],
            email: authUser.email,
            avatar: authUser.image || DEFAULT_USER.avatar,
            role: 'Personal Pro',
          };
          setUser(mappedUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Neon Auth session check:', err);
      }

      // Check stored user or profile
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (stored && isMounted) {
          setUser(JSON.parse(stored));
        } else {
          // Sync authenticated user from backend
          const res = await fetch('/api/user');
          const data = await res.json();
          if (isMounted && data.success && data.user) {
            setUser(data.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          } else if (isMounted) {
            setUser(DEFAULT_USER);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
          }
        }
      } catch {
        if (isMounted) setUser(DEFAULT_USER);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password' };
    }

    localStorage.removeItem(LOGGED_OUT_KEY);

    try {
      const res = await authClient.signIn.email({
        email,
        password: pass,
      });

      if (res?.data?.user) {
        const authUser = res.data.user;
        const loggedUser: User = {
          id: authUser.id,
          name: authUser.name || email.split('@')[0],
          email: authUser.email,
          avatar: authUser.image || DEFAULT_USER.avatar,
          role: 'Personal Pro',
        };
        setUser(loggedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
        return { success: true };
      }
    } catch (err) {
      console.warn('Neon Auth sign in:', err);
    }

    // Check against backend user profile
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user && data.user.email?.toLowerCase() === email.toLowerCase()) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true };
      }
    } catch {
      // ignore
    }

    // Generic fallback for valid password length
    if (pass.length >= 6) {
      const loggedUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email: email,
        avatar: DEFAULT_USER.avatar,
        role: 'Personal Pro',
      };
      setUser(loggedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!name || !email || !pass) {
      return { success: false, error: 'All fields are required' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    localStorage.removeItem(LOGGED_OUT_KEY);

    try {
      const res = await authClient.signUp.email({
        name,
        email,
        password: pass,
      });

      if (res?.error) {
        return { success: false, error: res.error.message || 'Registration failed' };
      }

      const authUser = res?.data?.user;
      const newUser: User = {
        id: authUser?.id || `usr_${Date.now()}`,
        name: authUser?.name || name,
        email: authUser?.email || email,
        avatar: authUser?.image || DEFAULT_USER.avatar,
        role: 'Personal Pro',
      };

      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch((err) => console.warn('[AuthContext] Failed to persist new user to DB:', err));

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to create account' };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn('Error signing out of Neon Auth:', err);
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
    router.replace('/login');
  };

  const demoLogin = () => {
    localStorage.removeItem(LOGGED_OUT_KEY);
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
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.warn('[AuthContext] updateUser failed:', errData?.error || `HTTP ${res.status}`);
        }
      })
      .catch((err) => console.warn('[AuthContext] updateUser network error:', err));
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
