import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { authService, notificationService, type AppNotification } from '../api/services';
import {
  addPushReceivedListener,
  getStoredPushRegistration,
  initializePushNotifications,
  type PushRegistration,
} from '../notifications/push';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';
import type { User } from '../types';

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
  pushPermissionStatus: string;
  pushRegistrationError: string;
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

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}

function normalizeNotification(notification: AppNotification): NotificationItem {
  return {
    ...notification,
    time: formatNotificationTime(notification.created_at),
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
  const [pushPermissionStatus, setPushPermissionStatus] = useState('unknown');
  const [pushRegistrationError, setPushRegistrationError] = useState('');
  const [pushRegistration, setPushRegistration] = useState<PushRegistration | null>(null);

  useEffect(() => {
    void initializePushNotifications().then((result) => {
      setPushPermissionStatus(result.permissionStatus);
      setPushRegistration(result.registration);
      setPushRegistrationError(result.error || '');
    });
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user || !token || locked) {
      setNotifications([]);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const result = await notificationService.list();
      setNotifications(result.notifications.map(normalizeNotification));
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Không thể tải thông báo.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [locked, token, user]);

  const registerPushToken = useCallback(async () => {
    if (!user || !token || locked) return;

    const registration = pushRegistration || await getStoredPushRegistration();
    if (!registration?.expo_push_token) return;

    try {
      await notificationService.registerPushToken(registration);
      setPushRegistrationError('');
    } catch (error) {
      setPushRegistrationError(error instanceof Error ? error.message : 'Không thể đăng ký push token.');
    }
  }, [locked, pushRegistration, token, user]);

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
    void registerPushToken();
  }, [refreshNotifications, registerPushToken]);

  useEffect(() => {
    if (!user || !token || locked) return undefined;

    const subscription = addPushReceivedListener(() => {
      void refreshNotifications();
    });

    return () => subscription.remove();
  }, [locked, refreshNotifications, token, user]);

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
    if (!user) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, read_at: n.read_at || new Date().toISOString() })));
    try {
      await notificationService.markRead();
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Không thể cập nhật thông báo.');
      await refreshNotifications();
    }
  }, [refreshNotifications, user]);

  const markNotificationOpened = useCallback(async (notificationId: number) => {
    if (!user || !notificationId) return;

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
    }
  }, [user]);

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
        const registration = await getStoredPushRegistration();
        if (registration?.expo_push_token) {
          await notificationService.unregisterPushToken(registration.expo_push_token).catch(() => undefined);
        }
        await Promise.all([
          removeStoredValue(TOKEN_KEY),
          removeStoredValue(USER_KEY),
        ]);
        setToken(null);
        setUser(null);
        setLocked(false);
        setNotifications([]);
      },
      updateUser: async (updatedUser) => {
        await setStoredValue(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      },
      notifications,
      notificationsLoading,
      notificationsError,
      pushPermissionStatus,
      pushRegistrationError,
      refreshNotifications,
      markAllNotificationsAsRead,
      markNotificationOpened,
    }),
    [
      biometricAvailable,
      biometricsEnabled,
      loading,
      locked,
      markAllNotificationsAsRead,
      markNotificationOpened,
      notifications,
      notificationsError,
      notificationsLoading,
      persistSession,
      pushPermissionStatus,
      pushRegistrationError,
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
