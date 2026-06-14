import { apiRequest } from './client';
import type { Booking, Property, User } from '../types';

export const propertyService = {
  list: () => apiRequest<Property[]>('/api/properties'),
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

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const bookingService = {
  list: () => apiRequest<Booking[]>('/api/user/bookings', { authenticated: true }),
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
