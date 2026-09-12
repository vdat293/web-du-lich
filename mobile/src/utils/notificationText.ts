import type { AppNotification } from '../api/services';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đã nhận phòng',
  checked_out: 'Đã hoàn tất',
  cancelled: 'Đã hủy',
  rejected: 'Đã từ chối',
  no_show: 'Không đến',
};

function localizeBookingStatus(value: string) {
  const normalized = value.trim().replace(/[.!?]+$/, '').toLowerCase().replace(/\s+/g, '_');
  return BOOKING_STATUS_LABELS[normalized] || value.trim();
}

function localizeBookingTitle(title: string) {
  const updated = /^Booking #(\d+) da cap nhat$/i.exec(title.trim());
  if (updated) return `Đặt phòng #${updated[1]} đã cập nhật`;

  const created = /^Booking #(\d+) da duoc tao$/i.exec(title.trim());
  if (created) return `Đặt phòng #${created[1]} đã được tạo`;

  const cancelled = /^Booking #(\d+) da bi huy$/i.exec(title.trim());
  if (cancelled) return `Đặt phòng #${cancelled[1]} đã bị hủy`;

  return title;
}

function localizeBookingBody(body: string) {
  const status = /^Trang thai dat phong tai (.+):\s*([^.]+)\.?$/i.exec(body.trim());
  if (status) {
    return `Trạng thái đặt phòng tại ${status[1]}: ${localizeBookingStatus(status[2])}.`;
  }

  const created = /^Don dat phong tai (.+) dang o trang thai (.+)\.?$/i.exec(body.trim());
  if (created) {
    return `Đơn đặt phòng tại ${created[1]} đang ở trạng thái ${localizeBookingStatus(created[2])}.`;
  }

  return body;
}

/**
 * Older notification rows were stored without Vietnamese diacritics. Localize
 * those known booking messages at read time so existing rows look consistent
 * without mutating the user's notification history in the database.
 */
export function localizeNotification(notification: AppNotification): AppNotification {
  return {
    ...notification,
    title: localizeBookingTitle(notification.title),
    body: localizeBookingBody(notification.body),
  };
}
