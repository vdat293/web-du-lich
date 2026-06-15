import { apiRequest } from './client';
import type { Booking, Property, Reward, RewardRedemption, User } from '../types';
import { resolveMediaUrl } from '../utils/media';

function normalizeProperty(property: Property): Property {
  return {
    ...property,
    host: { ...property.host, avatar: resolveMediaUrl(property.host.avatar) },
    images: {
      main: resolveMediaUrl(property.images.main),
      gallery: property.images.gallery.map(resolveMediaUrl),
    },
    mapImage: resolveMediaUrl(property.mapImage),
  };
}

export const propertyService = {
  list: async (filters: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    amenityIds?: number[];
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.checkIn) params.set('check_in', filters.checkIn);
    if (filters.checkOut) params.set('check_out', filters.checkOut);
    if (filters.guests) params.set('guests', String(filters.guests));
    if (filters.minPrice != null) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice != null) params.set('max_price', String(filters.maxPrice));
    if (filters.type) params.set('type', filters.type);
    if (filters.amenityIds?.length) params.set('amenities', filters.amenityIds.join(','));

    const query = params.toString();
    return (await apiRequest<Property[]>(`/api/properties${query ? `?${query}` : ''}`))
      .map(normalizeProperty);
  },
  checkAvailability: (payload: {
    room_type_id: number;
    check_in: string;
    check_out: string;
    number_of_rooms: number;
  }) =>
    apiRequest<{ success: boolean }>('/api/check-availability', {
      method: 'POST',
      body: JSON.stringify(payload),
  }),
};

export const wishlistService = {
  listIds: async () => {
    const items = await apiRequest<Array<{ property_id: number | string }>>('/api/user/wishlist', {
      authenticated: true,
    });
    return items.map((item) => Number(item.property_id));
  },
  add: (propertyId: number) =>
    apiRequest<{ message: string }>('/api/user/wishlist', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify({ property_id: propertyId }),
    }),
  remove: (propertyId: number) =>
    apiRequest<{ message: string }>(`/api/user/wishlist?property_id=${propertyId}`, {
      method: 'DELETE',
      authenticated: true,
    }),
};

export const authService = {
  login: (identifier: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      // The server keeps the legacy `email` field name but accepts email or phone.
      body: JSON.stringify({ email: identifier, password }),
    }),
  sendLoginOtp: (identifier: string) =>
    apiRequest<{ success: boolean; message: string; type: 'email' | 'sms'; dev_otp?: string }>(
      '/api/auth/send-login-otp',
      {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      },
    ),
  loginWithOtp: (identifier: string, otp: string) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/api/auth/otp-login', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    }),
};

export const bookingService = {
  list: async () => (await apiRequest<Booking[]>('/api/user/bookings', { authenticated: true }))
    .map((booking) => ({ ...booking, property_image: resolveMediaUrl(booking.property_image) })),
  createForUser: (payload: Record<string, unknown>) =>
    apiRequest<{ booking_id: number; final_price: number }>('/api/user/bookings', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify(payload),
    }),
  createForGuest: (payload: Record<string, unknown>) =>
    apiRequest<{ booking_id: number; status: string }>('/api/guest/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const paymentService = {
  initiate: (payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean; transaction_id: string; message: string }>(
      '/api/sandbox/payment',
      { method: 'POST', body: JSON.stringify({ action: 'initiate', ...payload }) },
    ),
  confirm: (transactionId: string, otp: string) =>
    apiRequest<{ success: boolean }>('/api/sandbox/payment', {
      method: 'POST',
      body: JSON.stringify({ action: 'confirm', transaction_id: transactionId, otp }),
    }),
  getBookingStatus: (bookingId: number) =>
    apiRequest<{ id: number; status: string; total_price: number; room_type_name?: string }>(
      `/api/bookings/${bookingId}/status`,
    ),
  cancelBooking: (bookingId: number, note: string) =>
    apiRequest<{ status: string }>(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled', note }),
    }),
};

export const userService = {
  getProfile: () =>
    apiRequest<{ user: User }>('/api/user/profile', {
      authenticated: true,
    }),
  updateProfile: (payload: { name: string; phone?: string; avatarBase64?: string }) =>
    apiRequest<{ message: string; user: User }>('/api/user/profile', {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(payload),
  }),
};

export const rewardService = {
  list: () =>
    apiRequest<{
      loyalty_points: number;
      rewards: Reward[];
      redemptions: RewardRedemption[];
    }>('/api/user/rewards', { authenticated: true }),
  redeem: (rewardKey: string, pin?: string) =>
    apiRequest<{ message: string; loyalty_points: number; coupon_code: string }>(
      '/api/user/rewards',
      {
        method: 'POST',
        authenticated: true,
        body: JSON.stringify({ reward_key: rewardKey, pin }),
      },
    ),
};

export const securityService = {
  sendSetupOtp: () =>
    apiRequest<{ success: boolean; message: string; dev_otp?: string }>(
      '/api/user/security/transaction-pin',
      {
        method: 'POST',
        authenticated: true,
        body: JSON.stringify({ action: 'send_otp' }),
      },
    ),
  verifySetupOtp: (code: string) =>
    apiRequest<{ success: boolean; setup_token: string; message: string }>(
      '/api/user/security/transaction-pin',
      {
        method: 'POST',
        authenticated: true,
        body: JSON.stringify({ action: 'verify_otp', code }),
      },
    ),
  setTransactionPin: (pin: string, setupToken: string) =>
    apiRequest<{ success: boolean; message: string }>(
      '/api/user/security/transaction-pin',
      {
        method: 'POST',
        authenticated: true,
        body: JSON.stringify({ action: 'set_pin', pin, setup_token: setupToken }),
      },
    ),
};

export const couponService = {
  validate: (code: string) =>
    apiRequest<{
      valid: boolean;
      message?: string;
      coupon?: {
        code: string;
        discount_type: 'fixed' | 'percent';
        discount_value: number;
        min_order_amount?: number | null;
      };
    }>(`/api/coupons?code=${encodeURIComponent(code)}`, { authenticated: true }),
};
