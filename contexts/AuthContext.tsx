'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ProfileSummary } from '../types';

interface AuthContextValue {
  profile: ProfileSummary | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setProfile(null);
          return;
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }

      const data = await response.json();
      setProfile(data.profile ?? data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'เข้าสู่ระบบไม่สำเร็จ');
      }

      await refreshProfile();
      return true;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      setProfile(null);
    } catch (err) {
      console.error(err);
      setError('ออกจากระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ profile, loading, error, login, logout, refreshProfile }),
    [profile, loading, error, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ต้องถูกใช้งานภายใต้ AuthProvider');
  }
  return context;
}