import { Platform } from 'react-native';

import { getStoredValue } from '../storage';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const defaultApiUrl = 'https://web-du-lich-4pjb.onrender.com';
const DEFAULT_TIMEOUT_MS = 15_000;

export const API_BASE_URL =
  configuredUrl || defaultApiUrl;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = RequestInit & {
  authenticated?: boolean;
  timeoutMs?: number;
};

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function subscribeToUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener());
}

function responseMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object') return fallback;
  const candidate = body as { message?: unknown; error?: unknown };
  if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message;
  if (typeof candidate.error === 'string' && candidate.error.trim()) return candidate.error;
  return fallback;
}

function isDevelopmentBuild() {
  return Boolean((globalThis as { __DEV__?: boolean }).__DEV__);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    authenticated = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    signal: externalSignal,
    ...requestOptions
  } = options;
  const token = await getStoredValue('aoklevart_token');

  if (authenticated && !token) {
    throw new ApiError('Bạn cần đăng nhập để tiếp tục.', 401);
  }

  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        'X-Client-Platform': `expo-${Platform.OS}`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError('Máy chủ phản hồi quá lâu. Vui lòng thử lại.', 408, 'REQUEST_TIMEOUT');
    }
    if (externalSignal?.aborted) {
      throw new ApiError('Yêu cầu đã bị hủy.', 0, 'REQUEST_ABORTED');
    }
    throw new ApiError(
      'Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng và thử lại.',
      0,
      'NETWORK_ERROR',
      error,
    );
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }

  const contentType = response.headers.get('content-type') || '';
  const body: unknown = response.status === 204
    ? undefined
    : contentType.includes('application/json')
      ? await response.json().catch(() => undefined)
      : await response.text().catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401 && authenticated) notifyUnauthorized();
    const errorBody = body && typeof body === 'object'
      ? body as { code?: unknown; details?: unknown; error?: unknown }
      : undefined;
    const serverError = typeof errorBody?.error === 'string' && errorBody.error.trim()
      ? errorBody.error
      : undefined;
    throw new ApiError(
      response.status >= 500 && isDevelopmentBuild() && serverError
        ? serverError
        : responseMessage(body, 'Yêu cầu không thành công.'),
      response.status,
      typeof errorBody?.code === 'string' ? errorBody.code : undefined,
      {
        apiPath: path,
        serverError,
        details: errorBody?.details,
      },
    );
  }
  return body as T;
}
