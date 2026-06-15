const defaultMediaBaseUrl = 'https://res.cloudinary.com/dptmoijn0/image/upload/web-du-lich';

export const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dptmoijn0/image/upload/c_crop,g_center,w_650,h_850/c_pad,b_rgb:FAF8F5,h_850,w_850/f_auto,q_auto/logo-aoklevart_vrh0ph';

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
