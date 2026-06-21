import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tuenmunpathfinder/notification-inbox';
const MAX_ITEMS = 100;

export type InboxNotification = {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  read: boolean;
  data?: Record<string, unknown>;
};

function sortByNewest(items: InboxNotification[]): InboxNotification[] {
  return [...items].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}

export async function loadNotificationInbox(): Promise<InboxNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InboxNotification[];
    return sortByNewest(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn('[notifications] Failed to load inbox:', error);
    return [];
  }
}

async function saveNotificationInbox(items: InboxNotification[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortByNewest(items).slice(0, MAX_ITEMS)));
}

export function createInboxNotification(input: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  id?: string;
  receivedAt?: string;
  read?: boolean;
}): InboxNotification {
  return {
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: input.title,
    body: input.body,
    data: input.data,
    receivedAt: input.receivedAt ?? new Date().toISOString(),
    read: input.read ?? false,
  };
}

export async function addNotificationToInbox(
  notification: InboxNotification,
): Promise<InboxNotification[]> {
  const existing = await loadNotificationInbox();
  const withoutDuplicate = existing.filter((item) => item.id !== notification.id);
  const next = sortByNewest([notification, ...withoutDuplicate]).slice(0, MAX_ITEMS);
  await saveNotificationInbox(next);
  return next;
}

export async function markNotificationRead(id: string): Promise<InboxNotification[]> {
  const existing = await loadNotificationInbox();
  const next = existing.map((item) => (item.id === id ? { ...item, read: true } : item));
  await saveNotificationInbox(next);
  return next;
}

export async function markAllNotificationsRead(): Promise<InboxNotification[]> {
  const existing = await loadNotificationInbox();
  const next = existing.map((item) => ({ ...item, read: true }));
  await saveNotificationInbox(next);
  return next;
}

export async function clearNotificationInbox(): Promise<InboxNotification[]> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  return [];
}

export function getUnreadCount(items: InboxNotification[]): number {
  return items.filter((item) => !item.read).length;
}

export function normalizeNotificationScreenPath(screen: string): string {
  const trimmed = screen.trim();
  if (!trimmed) return '/(tabs)/notifications';

  if (trimmed.startsWith('/(tabs)/') || trimmed.startsWith('/(auth)/')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/(tabs)/${trimmed}`;
}
