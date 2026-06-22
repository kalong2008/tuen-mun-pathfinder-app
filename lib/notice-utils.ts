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
