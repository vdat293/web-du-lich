import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { subscribeToUnauthorized } from '../api/client';
import { authService, notificationService, type AppNotification } from '../api/services';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';
import type { User } from '../types';
import { formatRelativeTime } from '../utils/date';

export type NotificationItem = AppNotification & {
  time: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  locked: boolean;
  biometricsEnabled: boolean;
  biometricAvailable: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  sendLoginOtp: (identifier: string) => Promise<void>;
  loginWithOtp: (identifier: string, otp: string) => Promise<void>;
  unlockWithBiometrics: () => Promise<boolean>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  notificationsError: string;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markNotificationOpened: (notificationId: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'aoklevart_token';
const USER_KEY = 'aoklevart_user';
const BIOMETRICS_KEY = 'aoklevart_biometrics_enabled';

async function getBiometricAvailability() {
  if (Platform.OS === 'web') return false;
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && isEnrolled;
}

function normalizeNotification(notification: AppNotification): NotificationItem {
  return {
    ...notification,
    time: formatRelativeTime(notification.created_at),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const notificationsRequestRef = useRef<{ key: string; promise: Promise<void> } | null>(null);
  const notificationGenerationRef = useRef(0);
  const notificationSessionKey = `${user?.id ?? ''}:${token ?? ''}:${locked ? 'locked' : 'unlocked'}`;
  const currentNotificationSessionKeyRef = useRef(notificationSessionKey);
  currentNotificationSessionKeyRef.current = notificationSessionKey;

  const clearLocalSession = useCallback(async () => {
    notificationGenerationRef.current += 1;
    await Promise.all([
      removeStoredValue(TOKEN_KEY),
      removeStoredValue(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
    setLocked(false);
    setNotifications([]);
  }, []);

  useEffect(() => subscribeToUnauthorized(() => {
    void clearLocalSession();
  }), [clearLocalSession]);

  const refreshNotifications = useCallback(async () => {
    const requestGeneration = notificationGenerationRef.current;
    const requestKey = `${notificationSessionKey}:${requestGeneration}`;
    const isCurrentSession = () => (
      notificationGenerationRef.current === requestGeneration
      && currentNotificationSessionKeyRef.current === notificationSessionKey
    );

    if (!user || !token || locked) {
      if (isCurrentSession()) {
        setNotifications([]);
        setNotificationsLoading(false);
      }
      return;
    }

    const existingRequest = notificationsRequestRef.current;
    if (existingRequest?.key === requestKey) return existingRequest.promise;

    const request = (async () => {
      if (!isCurrentSession()) return;
      setNotificationsLoading(true);
      setNotificationsError('');
      try {
        const result = await notificationService.list();
        if (isCurrentSession()) {
          setNotifications(result.notifications.map(normalizeNotification));
        }
      } catch (error) {
        if (isCurrentSession()) {
          setNotificationsError(error instanceof Error ? error.message : 'Không thể tải thông báo.');
        }
      } finally {
        if (isCurrentSession()) {
          setNotificationsLoading(false);
        }
      }
    })();
    notificationsRequestRef.current = { key: requestKey, promise: request };

    try {
      await request;
    } finally {
      if (notificationsRequestRef.current?.promise === request) notificationsRequestRef.current = null;
    }
  }, [locked, notificationSessionKey, token, user]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;

    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      const returningToForeground = previousState !== 'active' && nextState === 'active';
      previousState = nextState;

      if (!returningToForeground || !user || !token || locked) return;
      if (biometricsEnabled) {
        notificationGenerationRef.current += 1;
        setLocked(true);
        return;
      }

      // The inbox is API-backed; refresh when the session becomes visible
      // again so events completed while backgrounded appear without pull-to-refresh.
      void refreshNotifications();
    });

    return () => subscription.remove();
  }, [biometricsEnabled, locked, refreshNotifications, token, user]);

  useEffect(() => {
    void Promise.all([
      getStoredValue(TOKEN_KEY),
      getStoredValue(USER_KEY),
      getStoredValue(BIOMETRICS_KEY),
      getBiometricAvailability().catch(() => false),
    ]).then(([storedToken, storedUser, storedBiometricsEnabled, available]) => {
      const isBiometricsEnabled = storedBiometricsEnabled === 'true';
      const shouldLock = Platform.OS !== 'web'
        && isBiometricsEnabled
        && Boolean(storedToken && storedUser);

      setBiometricsEnabledState(isBiometricsEnabled);
      setBiometricAvailable(available);
      setLocked(shouldLock);

      if (!shouldLock) {
        setToken(storedToken);
        setUser(storedUser ? (JSON.parse(storedUser) as User) : null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    await Promise.all([
      setStoredValue(TOKEN_KEY, nextToken),
      setStoredValue(USER_KEY, JSON.stringify(nextUser)),
    ]);
    setToken(nextToken);
    setUser(nextUser);
    setLocked(false);
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    if (Platform.OS === 'web' || !biometricsEnabled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Mở khóa Aoklevart',
      cancelLabel: 'Hủy',
      fallbackLabel: 'Dùng mật mã thiết bị',
      disableDeviceFallback: false,
    });

    if (!result.success) return false;

    const [storedToken, storedUser] = await Promise.all([
      getStoredValue(TOKEN_KEY),
      getStoredValue(USER_KEY),
    ]);
    if (!storedToken || !storedUser) return false;

    setToken(storedToken);
    setUser(JSON.parse(storedUser) as User);
    setLocked(false);
    return true;
  }, [biometricsEnabled]);

  const setBiometricsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const available = await getBiometricAvailability();
      setBiometricAvailable(available);
      if (!available) {
        throw new Error('Thiết bị chưa thiết lập Face ID, Touch ID hoặc vân tay.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Bật đăng nhập sinh trắc học',
        cancelLabel: 'Hủy',
        fallbackLabel: 'Dùng mật mã thiết bị',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        throw new Error('Không thể xác thực sinh trắc học.');
      }
    }

    await setStoredValue(BIOMETRICS_KEY, String(enabled));
    setBiometricsEnabledState(enabled);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user || !token || locked) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, read_at: n.read_at || new Date().toISOString() })));
    try {
      await notificationService.markRead();
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Không thể cập nhật thông báo.');
      await refreshNotifications();
    }
  }, [locked, refreshNotifications, token, user]);

  const markNotificationOpened = useCallback(async (notificationId: number) => {
    if (!user || !token || locked || !notificationId) return;

    const timestamp = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (
      n.id === notificationId
        ? { ...n, unread: false, read_at: n.read_at || timestamp, opened_at: n.opened_at || timestamp }
        : n
    )));

    try {
      await notificationService.markOpened(notificationId);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Không thể cập nhật thông báo.');
      await refreshNotifications();
    }
  }, [locked, refreshNotifications, token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      locked,
      biometricsEnabled,
      biometricAvailable,
      login: async (identifier, password) => {
        const result = await authService.login(identifier, password);
        await persistSession(result.token, result.user);
      },
      sendLoginOtp: async (identifier) => {
        await authService.sendLoginOtp(identifier);
      },
      loginWithOtp: async (identifier, otp) => {
        const result = await authService.loginWithOtp(identifier, otp);
        await persistSession(result.token, result.user);
      },
      unlockWithBiometrics,
      setBiometricsEnabled,
      logout: async () => {
        await clearLocalSession();
      },
      updateUser: async (updatedUser) => {
        await setStoredValue(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      },
      notifications,
      notificationsLoading,
      notificationsError,
      refreshNotifications,
      markAllNotificationsAsRead,
      markNotificationOpened,
    }),
    [
      biometricAvailable,
      biometricsEnabled,
      clearLocalSession,
      loading,
      locked,
      markAllNotificationsAsRead,
      markNotificationOpened,
      notifications,
      notificationsError,
      notificationsLoading,
      persistSession,
      refreshNotifications,
      setBiometricsEnabled,
      token,
      unlockWithBiometrics,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
