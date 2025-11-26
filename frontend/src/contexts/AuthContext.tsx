"use client";

import { apiLogout } from '@/app/auth/actions';
import { getCurrentUser } from '@/lib/session';
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | undefined;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  checkUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const checkUserSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await getCurrentUser();
      if (userData) {
      window.dispatchEvent(new Event("user-logged-in"));
    }
      setUser(userData);
    } catch (error) {
      console.error("Failed to get user", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      checkUserSession();
    }
  }, [hasMounted, checkUserSession]);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Failed to logout", error);
    } finally {
      setUser(null);
    }
  }

  const value = { user, isLoading, logout, checkUserSession };

  if (!hasMounted) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
