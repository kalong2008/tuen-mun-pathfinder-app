import {
  findCampDateRangeForDate,
  formatActivityDate,
  formatActivityDateRange,
  type ActivitiesByDate,
} from '@/lib/calendar-utils';

export type NoticeItem = {
  id: string;
  title: string;
  date: string;
  activityType: string;
  pdfUrl: string[];
  target: string[];
};

const COMBINED_TARGET_LABELS = ['前鋒會及幼鋒會', '幼鋒會及前鋒會'] as const;

export function expandNoticeTargets(targets: string[]): string[] {
  const expanded: string[] = [];

  for (const target of targets) {
    if ((COMBINED_TARGET_LABELS as readonly string[]).includes(target)) {
      if (!expanded.includes('前鋒會')) expanded.push('前鋒會');
      if (!expanded.includes('幼鋒會')) expanded.push('幼鋒會');
      continue;
    }

    if (!expanded.includes(target)) {
      expanded.push(target);
    }
  }

  return expanded;
}

export function getClubShortLabel(label: string): string {
  switch (label) {
    case '前鋒會':
      return '前';
    case '幼鋒會':
      return '幼';
    default:
      return label;
  }
}

export function hasBothNoticeTargets(targets: string[]): boolean {
  const expanded = expandNoticeTargets(targets);
  return expanded.includes('前鋒會') && expanded.includes('幼鋒會');
}

export function formatNoticeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch {
    return dateString;
  }
}

function parseNoticeDateParts(dateString: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateString.split('-').map(Number);
  return { year, month, day };
}

export function formatNoticeDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatNoticeDate(startDate);
  }

  const start = parseNoticeDateParts(startDate);
  const end = parseNoticeDateParts(endDate);

  if (start.year === end.year) {
    if (start.month === end.month) {
      return `${start.year}年${start.month}月${start.day}–${end.day}日`;
    }
    return `${start.year}年${start.month}月${start.day}–${end.month}月${end.day}日`;
  }

  return `${formatNoticeDate(startDate)}–${formatNoticeDate(endDate)}`;
}

const NOTICE_TITLE_PREFIX = /^\d{4}年\d{1,2}月/;

export function getNoticeActivityName(notice: NoticeItem): string {
  const name = notice.title.replace(NOTICE_TITLE_PREFIX, '').trim();
  return name || notice.activityType;
}

export function getNoticeDisplayDate(
  notice: NoticeItem,
  activities?: ActivitiesByDate,
  options?: { includeYear?: boolean },
): string {
  const includeYear = options?.includeYear ?? true;
  const campRange = activities ? findCampDateRangeForDate(activities, notice.date) : null;

  if (!includeYear) {
    if (campRange) {
      return formatActivityDateRange(campRange.startDate, campRange.endDate);
    }
    return formatActivityDate(notice.date);
  }

  if (campRange) {
    return formatNoticeDateRange(campRange.startDate, campRange.endDate);
  }

  return formatNoticeDate(notice.date);
}

export function isNewNotice(dateString: string): boolean {
  const noticeDate = new Date(dateString);
  const today = new Date();
  const diffDays = Math.ceil((today.getTime() - noticeDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

export function isPastNotice(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const noticeDate = new Date(dateString);
  noticeDate.setHours(0, 0, 0, 0);
  return noticeDate < today;
}

export function sortNotices(notices: NoticeItem[]): NoticeItem[] {
  return [...notices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getNoticePreview(notices: NoticeItem[], limit = 2): NoticeItem[] {
  return sortNotices(notices)
    .filter((n) => !isPastNotice(n.date))
    .slice(0, limit);
}

export type NoticeClubFilter = 'all' | 'pathfinder' | 'adventurer';
export type NoticeTimelineFilter = 'active' | 'past';

export type NoticeFilters = {
  club: NoticeClubFilter;
  timeline: NoticeTimelineFilter;
};

export function noticeMatchesClubFilter(notice: NoticeItem, club: NoticeClubFilter): boolean {
  if (club === 'all') return true;

  const expanded = expandNoticeTargets(notice.target);

  switch (club) {
    case 'pathfinder':
      return expanded.includes('前鋒會');
    case 'adventurer':
      return expanded.includes('幼鋒會');
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export function filterNotices(notices: NoticeItem[], filters: NoticeFilters): NoticeItem[] {
  return notices
    .filter((notice) => noticeMatchesClubFilter(notice, filters.club))
    .filter((notice) =>
      filters.timeline === 'active' ? !isPastNotice(notice.date) : isPastNotice(notice.date),
    )
    .sort((a, b) => {
      if (filters.timeline === 'active') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export type NoticeSection = {
  title: string;
  data: NoticeItem[];
};

export function groupNoticesForTimeline(notices: NoticeItem[]): NoticeSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: NoticeItem[] = [];
  const past: NoticeItem[] = [];

  notices.forEach((notice) => {
    if (isPastNotice(notice.date)) {
      past.push(notice);
    } else {
      upcoming.push(notice);
    }
  });

  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sections: NoticeSection[] = [];
  if (upcoming.length > 0) sections.push({ title: '即將舉行', data: upcoming });
  if (past.length > 0) sections.push({ title: '較早通告', data: past });
  return sections;
}
