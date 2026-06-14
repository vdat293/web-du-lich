import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../api/services';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      getStoredValue('aoklevart_token'),
      getStoredValue('aoklevart_user'),
    ]).then(([storedToken, storedUser]) => {
      setToken(storedToken);
      setUser(storedUser ? (JSON.parse(storedUser) as User) : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const result = await authService.login(email, password);
        await Promise.all([
          setStoredValue('aoklevart_token', result.token),
          setStoredValue('aoklevart_user', JSON.stringify(result.user)),
        ]);
        setToken(result.token);
        setUser(result.user);
      },
      logout: async () => {
        await Promise.all([
          removeStoredValue('aoklevart_token'),
          removeStoredValue('aoklevart_user'),
        ]);
        setToken(null);
        setUser(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
