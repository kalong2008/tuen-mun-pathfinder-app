export type GallerySortOption = 'newest' | 'oldest' | 'name';

export type GalleryViewMode = 'card' | 'list';

export type GalleryListFilters = {
  year: number | null;
  activityType: string | null;
  sort: GallerySortOption;
};

export type PhotoSortOption = 'default' | 'reverse';

export type PhotoOrientationFilter = 'all' | 'landscape' | 'portrait' | 'square';

export type GalleryListItem = {
  name: string;
  title: string;
  apiEndpoint: string;
  coverUri: string;
  fallbackCoverUri: string;
};

export type GalleryPhotoItem = {
  id: string;
  uri: string;
  width: number;
  height: number;
};

export function parseGallerySortKey(name: string): number {
  const match = name.match(/^(\d{4})年(?:(\d{1,2})月)?/);
  if (!match) return 0;

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : 0;
  return year * 100 + month;
}

export function parseGalleryYear(name: string): number | null {
  const match = name.match(/^(\d{4})年/);
  return match ? Number(match[1]) : null;
}

export function parseGalleryActivityType(name: string): string | null {
  const match = name.match(/^\d{4}年(?:\d{1,2}月)?(.+)$/);
  const activity = match?.[1]?.trim();
  return activity || null;
}

export function extractGalleryYears(galleries: GalleryListItem[]): number[] {
  const years = new Set<number>();

  for (const gallery of galleries) {
    const year = parseGalleryYear(gallery.name);
    if (year) years.add(year);
  }

  return Array.from(years).sort((a, b) => b - a);
}

export function extractGalleryActivityTypes(galleries: GalleryListItem[]): string[] {
  const types = new Set<string>();

  for (const gallery of galleries) {
    const activity = parseGalleryActivityType(gallery.name);
    if (activity) types.add(activity);
  }

  return Array.from(types).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

export function filterAndSortGalleries(
  galleries: GalleryListItem[],
  filters: GalleryListFilters,
): GalleryListItem[] {
  let result = galleries;

  if (filters.year !== null) {
    result = result.filter((gallery) => parseGalleryYear(gallery.name) === filters.year);
  }

  if (filters.activityType) {
    result = result.filter(
      (gallery) => parseGalleryActivityType(gallery.name) === filters.activityType,
    );
  }

  const sorted = [...result];

  switch (filters.sort) {
    case 'newest':
      sorted.sort((a, b) => {
        const keyCompare = parseGallerySortKey(b.name) - parseGallerySortKey(a.name);
        if (keyCompare !== 0) return keyCompare;
        return a.name.localeCompare(b.name, 'zh-Hant');
      });
      break;
    case 'oldest':
      sorted.sort((a, b) => {
        const keyCompare = parseGallerySortKey(a.name) - parseGallerySortKey(b.name);
        if (keyCompare !== 0) return keyCompare;
        return a.name.localeCompare(b.name, 'zh-Hant');
      });
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
      break;
    default: {
      const unreachable: never = filters.sort;
      return unreachable;
    }
  }

  return sorted;
}

export function getPhotoOrientation(
  width: number,
  height: number,
): Exclude<PhotoOrientationFilter, 'all'> {
  if (!width || !height) return 'square';
  const ratio = width / height;
  if (ratio > 1.05) return 'landscape';
  if (ratio < 0.95) return 'portrait';
  return 'square';
}

export function filterAndSortPhotos(
  photos: GalleryPhotoItem[],
  orientation: PhotoOrientationFilter,
  sort: PhotoSortOption,
): GalleryPhotoItem[] {
  let result = photos;

  if (orientation !== 'all') {
    result = result.filter(
      (photo) => getPhotoOrientation(photo.width, photo.height) === orientation,
    );
  }

  if (sort === 'reverse') {
    return [...result].reverse();
  }

  return result;
}
