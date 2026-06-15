import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { authService } from '../api/services';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';
import type { User } from '../types';

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  time: string;
  unread: boolean;
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
  markAllNotificationsAsRead: () => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Đặt phòng thành công 🏨',
      body: 'Đặt phòng của bạn tại Luxury Villa Đà Lạt đã được xác nhận. Chuẩn bị lên đường thôi!',
      time: '1 ngày trước',
      unread: true,
    },
    {
      id: 2,
      title: 'Khuyến mãi độc quyền 🎁',
      body: 'Nhập mã AOKLEVART20 để nhận ưu đãi giảm 20% cho chuyến đi tiếp theo.',
      time: '2 ngày trước',
      unread: true,
    },
    {
      id: 3,
      title: 'Chào mừng bạn mới 🎉',
      body: 'Cảm ơn bạn đã tham gia Aoklevart. Khám phá những khách sạn tuyệt vời nhất ngay hôm nay.',
      time: '3 ngày trước',
      unread: false,
    },
  ]);

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        await Promise.all([
          removeStoredValue(TOKEN_KEY),
          removeStoredValue(USER_KEY),
        ]);
        setToken(null);
        setUser(null);
        setLocked(false);
      },
      updateUser: async (updatedUser) => {
        await setStoredValue(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      },
      notifications,
      markAllNotificationsAsRead,
    }),
    [
      biometricAvailable,
      biometricsEnabled,
      loading,
      locked,
      notifications,
      persistSession,
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
