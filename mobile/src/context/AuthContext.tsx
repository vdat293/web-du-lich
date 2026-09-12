import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type {
  LocalAuthenticationOptions,
  LocalAuthenticationResult,
} from 'expo-local-authentication';

import { subscribeToUnauthorized } from '../api/client';
import { authService, notificationService, type AppNotification } from '../api/services';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';
import type { User } from '../types';
import { formatRelativeTime } from '../utils/date';
import { localizeNotification } from '../utils/notificationText';

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
  authenticateWithBiometrics: (options: LocalAuthenticationOptions) => Promise<LocalAuthenticationResult>;
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
const BIOMETRICS_USER_KEY = 'aoklevart_biometrics_user_id';
const BIOMETRIC_FOREGROUND_GRACE_MS = 1500;

async function getBiometricAvailability() {
  if (Platform.OS === 'web') return false;
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && isEnrolled;
}

function normalizeNotification(notification: AppNotification): NotificationItem {
  const localized = localizeNotification(notification);
  return {
    ...localized,
    time: formatRelativeTime(localized.created_at),
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
  const biometricPromptActiveRef = useRef(false);
  const biometricPromptFinishedAtRef = useRef(0);
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
      removeStoredValue(BIOMETRICS_KEY),
      removeStoredValue(BIOMETRICS_USER_KEY),
    ]);
    setToken(null);
    setUser(null);
    setLocked(false);
    setBiometricsEnabledState(false);
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

      // LocalAuthentication temporarily moves the app through inactive/background
      // states. That is not a real app switch, so do not lock the session when the
      // biometric prompt itself returns to the foreground.
      const promptJustFinished = Date.now() - biometricPromptFinishedAtRef.current < BIOMETRIC_FOREGROUND_GRACE_MS;
      if (biometricPromptActiveRef.current || promptJustFinished || !returningToForeground || !user || !token || locked) return;
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
    async function hydrateSession() {
      try {
        const [storedToken, storedUser, storedBiometricsEnabled, storedBiometricsUserId, available] = await Promise.all([
          getStoredValue(TOKEN_KEY),
          getStoredValue(USER_KEY),
          getStoredValue(BIOMETRICS_KEY),
          getStoredValue(BIOMETRICS_USER_KEY),
          getBiometricAvailability().catch(() => false),
        ]);
        let parsedUser: User | null = null;
        try {
          parsedUser = storedUser ? (JSON.parse(storedUser) as User) : null;
        } catch {
          parsedUser = null;
        }

        let isBiometricsEnabled = storedBiometricsEnabled === 'true';
        const hasSession = Boolean(storedToken && parsedUser);
        if (isBiometricsEnabled && hasSession) {
          const biometricsBelongToUser = !storedBiometricsUserId
            || storedBiometricsUserId === String(parsedUser?.id);
          if (biometricsBelongToUser && !storedBiometricsUserId && parsedUser) {
            // Migrate older opt-ins without ever storing a password.
            await setStoredValue(BIOMETRICS_USER_KEY, String(parsedUser.id));
          } else if (!biometricsBelongToUser) {
            isBiometricsEnabled = false;
            await Promise.all([
              removeStoredValue(BIOMETRICS_KEY),
              removeStoredValue(BIOMETRICS_USER_KEY),
            ]);
          }
        } else if (isBiometricsEnabled) {
          // A biometric preference without a session must never unlock anything.
          isBiometricsEnabled = false;
          await Promise.all([
            removeStoredValue(BIOMETRICS_KEY),
            removeStoredValue(BIOMETRICS_USER_KEY),
          ]);
        }

        const shouldLock = Platform.OS !== 'web' && isBiometricsEnabled && hasSession;
        setBiometricsEnabledState(isBiometricsEnabled);
        setBiometricAvailable(available);
        setLocked(shouldLock);

        if (!shouldLock) {
          setToken(hasSession ? storedToken : null);
          setUser(hasSession ? parsedUser : null);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }

    void hydrateSession();
  }, []);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    const [storedBiometricsEnabled, storedBiometricsUserId] = await Promise.all([
      getStoredValue(BIOMETRICS_KEY),
      getStoredValue(BIOMETRICS_USER_KEY),
    ]);
    if (storedBiometricsEnabled === 'true' && storedBiometricsUserId !== String(nextUser.id)) {
      // A fallback login may switch accounts. Do not carry the previous
      // account's biometric opt-in to the new account.
      await Promise.all([
        removeStoredValue(BIOMETRICS_KEY),
        removeStoredValue(BIOMETRICS_USER_KEY),
      ]);
      setBiometricsEnabledState(false);
    }
    await Promise.all([
      setStoredValue(TOKEN_KEY, nextToken),
      setStoredValue(USER_KEY, JSON.stringify(nextUser)),
    ]);
    setToken(nextToken);
    setUser(nextUser);
    setLocked(false);
  }, []);

  const authenticateWithBiometrics = useCallback(async (
    options: LocalAuthenticationOptions,
  ): Promise<LocalAuthenticationResult> => {
    if (biometricPromptActiveRef.current) {
      return { success: false, error: 'app_cancel' };
    }

    biometricPromptActiveRef.current = true;
    try {
      return await LocalAuthentication.authenticateAsync(options);
    } finally {
      biometricPromptActiveRef.current = false;
      biometricPromptFinishedAtRef.current = Date.now();
    }
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    if (Platform.OS === 'web' || !biometricsEnabled) return false;

    const result = await authenticateWithBiometrics({
      promptMessage: 'Mở khóa Aoklevart',
      cancelLabel: 'Hủy',
      fallbackLabel: 'Dùng mật mã thiết bị',
      disableDeviceFallback: false,
    });

    if (!result.success) return false;

    const [storedToken, storedUser, storedBiometricsUserId] = await Promise.all([
      getStoredValue(TOKEN_KEY),
      getStoredValue(USER_KEY),
      getStoredValue(BIOMETRICS_USER_KEY),
    ]);
    if (!storedToken || !storedUser) return false;

    let parsedUser: User;
    try {
      parsedUser = JSON.parse(storedUser) as User;
    } catch {
      return false;
    }
    if (storedBiometricsUserId && storedBiometricsUserId !== String(parsedUser.id)) return false;

    setToken(storedToken);
    setUser(parsedUser);
    setLocked(false);
    return true;
  }, [authenticateWithBiometrics, biometricsEnabled]);

  const setBiometricsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      if (!user || !token) {
        throw new Error('Bạn cần đăng nhập trước khi bật sinh trắc học.');
      }
      const available = await getBiometricAvailability();
      setBiometricAvailable(available);
      if (!available) {
        throw new Error('Thiết bị chưa thiết lập Face ID, Touch ID hoặc vân tay.');
      }

      const result = await authenticateWithBiometrics({
        promptMessage: 'Bật đăng nhập sinh trắc học',
        cancelLabel: 'Hủy',
        fallbackLabel: 'Dùng mật mã thiết bị',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        throw new Error('Không thể xác thực sinh trắc học.');
      }
    }

    if (enabled) {
      const biometricUserId = user?.id;
      await Promise.all([
        setStoredValue(BIOMETRICS_KEY, 'true'),
        setStoredValue(BIOMETRICS_USER_KEY, String(biometricUserId)),
      ]);
    } else {
      await Promise.all([
        removeStoredValue(BIOMETRICS_KEY),
        removeStoredValue(BIOMETRICS_USER_KEY),
      ]);
    }
    setBiometricsEnabledState(enabled);
  }, [authenticateWithBiometrics, token, user]);

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
      authenticateWithBiometrics,
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
      authenticateWithBiometrics,
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
