import i18n from '../i18n';

export function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  return { checkIn: toDateInput(checkIn), checkOut: toDateInput(checkOut) };
}

export function countNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const value = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function formatDate(value: string) {
  const normalizedValue = value.trim();
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(normalizedValue);
  const date = dateParts
    ? new Date(
        Number(dateParts[1]),
        Number(dateParts[2]) - 1,
        Number(dateParts[3]),
      )
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getAppLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(getAppLocale(), {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(getAppLocale()).format(value);
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  const formatter = new Intl.RelativeTimeFormat(getAppLocale(), { numeric: 'auto' });
  if (diffMinutes < 60) return formatter.format(-diffMinutes, 'minute');

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return formatter.format(-diffHours, 'hour');

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return formatter.format(-diffDays, 'day');

  return new Intl.DateTimeFormat(getAppLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
export function getAppLocale() {
  return i18n.resolvedLanguage?.startsWith('en') || i18n.language.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
}
