export type MenuItemIcon = {
  ios: string;
  android: string;
};

export type MenuOption<T extends string = string> = {
  value: T;
  label: string;
  icon: MenuItemIcon;
};

export const MENU_ICONS = {
  calendar: { ios: 'calendar', android: 'calendar_today' },
  list: { ios: 'list.bullet', android: 'format_list_bulleted' },
  card: { ios: 'square.grid.2x2', android: 'grid_view' },
  allClubs: { ios: 'person.3.fill', android: 'groups' },
  pathfinder: { ios: 'flag.fill', android: 'flag' },
  adventurer: { ios: 'figure.child', android: 'child_care' },
  upcoming: { ios: 'calendar.badge.clock', android: 'schedule' },
  past: { ios: 'clock.arrow.circlepath', android: 'history' },
  sortNewest: { ios: 'arrow.down.circle', android: 'arrow_circle_down' },
  sortOldest: { ios: 'arrow.up.circle', android: 'arrow_circle_up' },
  sortName: { ios: 'textformat', android: 'sort_by_alpha' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'filter_list' },
  year: { ios: 'calendar', android: 'event' },
  yearAll: { ios: 'calendar.badge.plus', android: 'event_available' },
} as const satisfies Record<string, MenuItemIcon>;

export const CLUB_MENU_OPTIONS = [
  { value: 'all', label: '所有', icon: MENU_ICONS.allClubs },
  { value: 'pathfinder', label: '前鋒會', icon: MENU_ICONS.pathfinder },
  { value: 'adventurer', label: '幼鋒會', icon: MENU_ICONS.adventurer },
] as const satisfies readonly MenuOption[];

export const UPCOMING_MENU_OPTIONS = [
  { value: 'upcoming', label: '即將舉行', icon: MENU_ICONS.upcoming },
  { value: 'past', label: '已結束', icon: MENU_ICONS.past },
] as const satisfies readonly MenuOption[];

export const NOTICE_TIMELINE_MENU_OPTIONS = [
  { value: 'active', label: '即將舉行', icon: MENU_ICONS.upcoming },
  { value: 'past', label: '已結束', icon: MENU_ICONS.past },
] as const satisfies readonly MenuOption[];

export const ACTIVITY_VIEW_MENU_OPTIONS = [
  { value: 'calendar', label: '月曆', icon: MENU_ICONS.calendar },
  { value: 'list', label: '列表', icon: MENU_ICONS.list },
] as const satisfies readonly MenuOption[];

export const GALLERY_VIEW_MENU_OPTIONS = [
  { value: 'card', label: '卡片', icon: MENU_ICONS.card },
  { value: 'list', label: '列表', icon: MENU_ICONS.list },
] as const satisfies readonly MenuOption[];

export const GALLERY_SORT_MENU_OPTIONS = [
  { value: 'newest', label: '按最新加入', icon: MENU_ICONS.sortNewest },
  { value: 'oldest', label: '按最舊加入', icon: MENU_ICONS.sortOldest },
  { value: 'name', label: '按名稱', icon: MENU_ICONS.sortName },
] as const satisfies readonly MenuOption[];

export const MENU_GROUP_LABELS = {
  view: '顯示方式',
  club: '參與對象',
  timeline: '時間',
  sort: '排序',
  year: '年份',
} as const;
