import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { getStoredValue } from '../storage';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL =
  configuredUrl || `http://${expoHost || fallbackHost}:3000`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = RequestInit & { authenticated?: boolean };

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { authenticated = false, headers, ...requestOptions } = options;
  const token = await getStoredValue('aoklevart_token');

  if (authenticated && !token) {
    throw new ApiError('Bạn cần đăng nhập để tiếp tục.', 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Platform': `expo-${Platform.OS}`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(
      `Không thể kết nối máy chủ tại ${API_BASE_URL}. Hãy kiểm tra server và mạng LAN.`,
      0,
    );
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.message || 'Yêu cầu không thành công.', response.status);
  }
  return body as T;
}
