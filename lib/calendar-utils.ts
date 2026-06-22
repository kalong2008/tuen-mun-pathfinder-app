export type CalendarActivity = {
  id: number;
  title: string;
  time: string;
  location: string;
  isCamp?: true;
  campKey?: string;
  marking: {
    startingDay?: boolean;
    endingDay?: boolean;
  };
};

export type ActivitiesByDate = Record<string, CalendarActivity[]>;

export type DatedActivity = {
  date: string;
  activity: CalendarActivity;
};

export type ActivityClub = 'PATHFINDER' | 'ADVENTURER' | 'BOTH';

export function parseActivityClub(title: string): ActivityClub | null {
  const normalized = title.replace(/\s/g, '');

  if (
    normalized.includes('前鋒會＋幼鋒會') ||
    normalized.includes('幼鋒會＋前鋒會') ||
    normalized.includes('前鋒會及幼鋒會')
  ) {
    return 'BOTH';
  }
  if (normalized.includes('幼鋒會')) {
    return 'ADVENTURER';
  }
  if (normalized.includes('前鋒會')) {
    return 'PATHFINDER';
  }
  return null;
}

export function getActivityDisplayName(title: string): string {
  const withoutClub = title.replace(/（[^）]+）\s*$/, '').trim();
  return withoutClub || title;
}

export function getActivityClubLabel(club: ActivityClub): string {
  switch (club) {
    case 'PATHFINDER':
      return '前鋒會';
    case 'ADVENTURER':
      return '幼鋒會';
    case 'BOTH':
      return '前鋒會及幼鋒會';
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export type ActivityClubBadge = {
  club: 'PATHFINDER' | 'ADVENTURER';
  label: string;
};

export function getActivityClubBadges(club: ActivityClub): ActivityClubBadge[] {
  switch (club) {
    case 'PATHFINDER':
      return [{ club: 'PATHFINDER', label: '前鋒會' }];
    case 'ADVENTURER':
      return [{ club: 'ADVENTURER', label: '幼鋒會' }];
    case 'BOTH':
      return [
        { club: 'PATHFINDER', label: '前鋒會' },
        { club: 'ADVENTURER', label: '幼鋒會' },
      ];
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export type CombinedActivity = {
  activity: CalendarActivity;
  startDate: string;
  endDate: string;
  dateLabel: string;
};

function dateAtMidnight(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function splitContiguousDateGroups(dates: string[]): string[][] {
  if (dates.length === 0) return [];

  const sorted = [...dates].sort();
  const groups: string[][] = [[sorted[0]]];

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = dateAtMidnight(sorted[index - 1]);
    const current = dateAtMidnight(sorted[index]);
    const dayDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      groups[groups.length - 1].push(sorted[index]);
    } else {
      groups.push([sorted[index]]);
    }
  }

  return groups;
}

export function findCampDateRangeForDate(
  activities: ActivitiesByDate,
  dateString: string,
): { startDate: string; endDate: string } | null {
  const activitiesOnDate = activities[dateString];
  if (!activitiesOnDate?.length) {
    return null;
  }

  const campActivity = activitiesOnDate.find((activity) => activity.campKey);
  if (!campActivity?.campKey) {
    return null;
  }

  const campKey = campActivity.campKey;
  const dates: string[] = [];

  for (const [date, list] of Object.entries(activities)) {
    for (const activity of list) {
      if (activity.campKey === campKey) {
        dates.push(date);
      }
    }
  }

  for (const dateGroup of splitContiguousDateGroups(dates)) {
    if (dateGroup.includes(dateString)) {
      return {
        startDate: dateGroup[0],
        endDate: dateGroup[dateGroup.length - 1],
      };
    }
  }

  return null;
}

export function formatActivityDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatActivityDate(startDate);
  }

  const start = dateAtMidnight(startDate);
  const end = dateAtMidnight(endDate);
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}月${startDay}–${endDay}日`;
  }

  return `${startMonth}月${startDay}–${endMonth}月${endDay}日`;
}

function buildCombinedFromEntries(entries: DatedActivity[]): CombinedActivity[] {
  const campGroups = new Map<string, DatedActivity[]>();
  const singles: DatedActivity[] = [];

  for (const entry of entries) {
    const { activity, date } = entry;
    if (activity.campKey) {
      const existing = campGroups.get(activity.campKey);
      if (!existing) {
        campGroups.set(activity.campKey, [entry]);
      } else {
        existing.push(entry);
      }
    } else {
      singles.push(entry);
    }
  }

  const combined: CombinedActivity[] = [];

  for (const groupEntries of campGroups.values()) {
    const activityByDate = new Map(groupEntries.map((entry) => [entry.date, entry.activity]));
    const dates = groupEntries.map((entry) => entry.date);

    for (const dateGroup of splitContiguousDateGroups(dates)) {
      const startDate = dateGroup[0];
      const endDate = dateGroup[dateGroup.length - 1];
      const activity = activityByDate.get(startDate);
      if (!activity) continue;

      combined.push({
        activity,
        startDate,
        endDate,
        dateLabel: formatActivityDateRange(startDate, endDate),
      });
    }
  }

  for (const { date, activity } of singles) {
    combined.push({
      activity,
      startDate: date,
      endDate: date,
      dateLabel: formatActivityDate(date),
    });
  }

  combined.sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    return a.activity.time.localeCompare(b.activity.time);
  });

  return combined;
}

function isDateInMonthKeys(dateString: string, monthKeys: string[]): boolean {
  return monthKeys.includes(dateString.substring(0, 7));
}

export function getVisibleMonthKeys(count: number): string[] {
  const now = new Date();
  const keys: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    keys.push(`${date.getFullYear()}-${month}`);
  }

  return keys;
}

export function getCombinedUpcomingActivities(
  activities: ActivitiesByDate,
  options: {
    limit?: number;
    /** Current month plus this many following months (e.g. 2 → 3 months total). */
    additionalMonths?: number;
  } = {},
): CombinedActivity[] {
  const { limit, additionalMonths } = options;
  const allowedMonthKeys =
    additionalMonths !== undefined
      ? getVisibleMonthKeys(additionalMonths + 1)
      : null;
  const today = dateAtMidnight(new Date().toISOString().split('T')[0]);
  const campGroups = new Map<string, DatedActivity[]>();
  const singles: DatedActivity[] = [];

  for (const [date, list] of Object.entries(activities)) {
    for (const activity of list) {
      if (activity.campKey) {
        const existing = campGroups.get(activity.campKey);
        const entry = { date, activity };
        if (!existing) {
          campGroups.set(activity.campKey, [entry]);
        } else {
          existing.push(entry);
        }
      } else if (dateAtMidnight(date) >= today) {
        singles.push({ date, activity });
      }
    }
  }

  const combined: CombinedActivity[] = [];

  for (const groupEntries of campGroups.values()) {
    const activityByDate = new Map(groupEntries.map((entry) => [entry.date, entry.activity]));
    const dates = groupEntries.map((entry) => entry.date);

    for (const dateGroup of splitContiguousDateGroups(dates)) {
      const startDate = dateGroup[0];
      const endDate = dateGroup[dateGroup.length - 1];
      if (dateAtMidnight(endDate) < today) continue;

      const activity = activityByDate.get(startDate);
      if (!activity) continue;

      combined.push({
        activity,
        startDate,
        endDate,
        dateLabel: formatActivityDateRange(startDate, endDate),
      });
    }
  }

  for (const { date, activity } of singles) {
    combined.push({
      activity,
      startDate: date,
      endDate: date,
      dateLabel: formatActivityDate(date),
    });
  }

  const filtered = allowedMonthKeys
    ? combined.filter((item) => isDateInMonthKeys(item.startDate, allowedMonthKeys))
    : combined;

  filtered.sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    return a.activity.time.localeCompare(b.activity.time);
  });

  if (limit === undefined) {
    return filtered;
  }

  return filtered.slice(0, limit);
}

export function getNextUpcomingActivity(
  activities: ActivitiesByDate,
): CombinedActivity | null {
  return getCombinedUpcomingActivities(activities, { limit: 1 })[0] ?? null;
}

export function getCombinedMonthActivities(
  activities: ActivitiesByDate,
  monthKey: string,
): CombinedActivity[] {
  const entries: DatedActivity[] = [];

  for (const [date, list] of Object.entries(activities)) {
    if (!date.startsWith(monthKey)) continue;
    for (const activity of list) {
      entries.push({ date, activity });
    }
  }

  return buildCombinedFromEntries(entries);
}

export function getUpcomingActivities(
  activities: ActivitiesByDate,
  limit = 5,
): DatedActivity[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries: DatedActivity[] = [];

  for (const [date, list] of Object.entries(activities)) {
    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);
    if (activityDate < today) continue;

    for (const activity of list) {
      entries.push({ date, activity });
    }
  }

  entries.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.activity.time.localeCompare(b.activity.time);
  });

  return entries.slice(0, limit);
}

export function formatActivityDate(dateString: string): string {
  const date = dateAtMidnight(dateString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function getMonthActivities(
  activities: ActivitiesByDate,
  monthKey: string,
): DatedActivity[] {
  const entries: DatedActivity[] = [];

  for (const [date, list] of Object.entries(activities)) {
    if (!date.startsWith(monthKey)) continue;
    for (const activity of list) {
      entries.push({ date, activity });
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));
  return entries;
}

export type ActivityClubFilter = 'all' | 'pathfinder' | 'adventurer';
export type ActivityTimelineFilter = 'upcoming' | 'past';
export type ActivityViewMode = 'list' | 'calendar';

export type ActivityFilters = {
  club: ActivityClubFilter;
  timeline: ActivityTimelineFilter;
};

export type ActivitySection = {
  title: string;
  data: CombinedActivity[];
};

export function isRecurringMeeting(activity: CalendarActivity): boolean {
  return activity.title.includes('集會');
}

export function isPastCombinedActivity(item: CombinedActivity): boolean {
  const today = dateAtMidnight(new Date().toISOString().split('T')[0]);
  return dateAtMidnight(item.endDate) < today;
}

export function activityMatchesClubFilter(
  activity: CalendarActivity,
  club: ActivityClubFilter,
): boolean {
  if (club === 'all') return true;

  const parsed = parseActivityClub(activity.title);
  if (!parsed) return true;

  switch (club) {
    case 'pathfinder':
      return parsed === 'PATHFINDER' || parsed === 'BOTH';
    case 'adventurer':
      return parsed === 'ADVENTURER' || parsed === 'BOTH';
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export function getAllCombinedActivities(activities: ActivitiesByDate): CombinedActivity[] {
  const entries: DatedActivity[] = [];

  for (const [date, list] of Object.entries(activities)) {
    for (const activity of list) {
      entries.push({ date, activity });
    }
  }

  return buildCombinedFromEntries(entries);
}

export function filterCombinedActivities(
  items: CombinedActivity[],
  filters: ActivityFilters,
): CombinedActivity[] {
  const filtered = items
    .filter((item) => activityMatchesClubFilter(item.activity, filters.club))
    .filter((item) =>
      filters.timeline === 'upcoming'
        ? !isPastCombinedActivity(item)
        : isPastCombinedActivity(item),
    );

  filtered.sort((a, b) => {
    if (filters.timeline === 'upcoming') {
      const dateCompare = a.startDate.localeCompare(b.startDate);
      if (dateCompare !== 0) return dateCompare;
      return a.activity.time.localeCompare(b.activity.time);
    }

    const dateCompare = b.startDate.localeCompare(a.startDate);
    if (dateCompare !== 0) return dateCompare;
    return b.activity.time.localeCompare(a.activity.time);
  });

  return filtered;
}

export function groupActivitiesByMonth(items: CombinedActivity[]): ActivitySection[] {
  const sections = new Map<string, CombinedActivity[]>();

  for (const item of items) {
    const [year, month] = item.startDate.split('-');
    const key = `${year}-${month}`;
    const existing = sections.get(key);
    if (existing) {
      existing.push(item);
    } else {
      sections.set(key, [item]);
    }
  }

  return [...sections.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([monthKey, data]) => ({
      title: formatActivityMonthTitle(monthKey),
      data,
    }));
}

export function formatActivityMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year}年${month}月`;
}
