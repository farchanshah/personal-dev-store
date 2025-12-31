import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@devstore/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUser();
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Login failed' };
    }
  }, [fetchUser, router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Logout failed' };
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUser();
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Registration failed' };
    }
  }, [fetchUser, router]);

  const sendMagicLink = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, error: 'Failed to send magic link' };
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    login,
    logout,
    register,
    sendMagicLink,
    refreshUser: fetchUser,
    isAuthenticated: !!user,
  };
}