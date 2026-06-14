const defaultMediaBaseUrl = 'https://res.cloudinary.com/dptmoijn0/image/upload/web-du-lich';

export const MEDIA_BASE_URL = (
  import.meta.env.VITE_MEDIA_BASE_URL || defaultMediaBaseUrl
).replace(/\/$/, '');

export function assetUrl(path) {
  const normalizedPath = path.replace(/^\/?assets\//, '');
  return `${MEDIA_BASE_URL}/assets/${normalizedPath}`;
}

export function resolveMediaUrl(value) {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value || '';
  if (/^\/?assets\//i.test(value)) return assetUrl(value);
  return `/${value.replace(/^\/+/, '')}`;
}
