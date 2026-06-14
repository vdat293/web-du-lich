const mediaBaseUrl = 'https://res.cloudinary.com/dptmoijn0/image/upload/web-du-lich';

export function resolveMediaUrl(value?: string) {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value || '';

  const normalized = value.replace(/^\/+/, '');
  if (normalized.startsWith('assets/')) {
    return `${mediaBaseUrl}/${normalized}`;
  }

  return value;
}
