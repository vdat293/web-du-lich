import type { AppNotification } from '../api/services';
import { localizeNotification } from './notificationText';

function notification(title: string, body: string): AppNotification {
  return {
    id: 1,
    title,
    body,
    type: 'booking_status',
    unread: true,
    created_at: '2026-09-12T10:00:00Z',
  };
}

describe('notification text localization', () => {
  it('adds Vietnamese diacritics to legacy booking status messages', () => {
    const result = localizeNotification(notification(
      'Booking #20 da cap nhat',
      'Trang thai dat phong tai The Capella: confirmed.',
    ));

    expect(result.title).toBe('Đặt phòng #20 đã cập nhật');
    expect(result.body).toBe('Trạng thái đặt phòng tại The Capella: Đã xác nhận.');
  });

  it('localizes legacy booking creation messages without changing other text', () => {
    const result = localizeNotification(notification(
      'Booking #21 da duoc tao',
      'Don dat phong tai Aoklevart dang o trang thai pending.',
    ));

    expect(result.title).toBe('Đặt phòng #21 đã được tạo');
    expect(result.body).toBe('Đơn đặt phòng tại Aoklevart đang ở trạng thái Chờ xác nhận.');

    const custom = notification('Ưu đãi cuối tuần', 'Giảm 20% cho kỳ nghỉ của bạn.');
    expect(localizeNotification(custom)).toMatchObject(custom);
  });
});
