/**
 * Photo assets are stored on GCS. JSON manifests use relative paths like
 * `/photo/2025/2025-08-promotion/2025-08-promotion-1.jpg`.
 */
export const PHOTO_BASE_URL =
  process.env.EXPO_PUBLIC_PHOTO_BASE_URL ??
  'https://storage.googleapis.com/tuenmunpathfinder-storage';

export function getPhotoUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;
  return `${PHOTO_BASE_URL}/${path}`;
}

/** Hero banner on home and sign-in — matches tuenmunpathfinder.com homepage */
export const HERO_BANNER_PHOTO = getPhotoUrl(
  '/photo/2025/2025-08-promotion/2025-08-promotion-54.jpg',
);
