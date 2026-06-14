import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  notifications: NotificationItem[];
  markAllNotificationsAsRead: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      updateUser: async (updatedUser) => {
        await setStoredValue('aoklevart_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      },
      notifications,
      markAllNotificationsAsRead,
    }),
    [loading, token, user, notifications],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
