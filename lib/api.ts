export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tuenmunpathfinder.com';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const API = {
  calendar: () => apiUrl('/api/calendar'),
  notices: () => apiUrl('/api/notices'),
  photoLinks: () => apiUrl('/api/photo-links'),
  send: () => apiUrl('/api/send'),
  bibleCached: () => apiUrl('/api/bible/cached'),
  registerPush: () => apiUrl('/api/register-push'),
} as const;
