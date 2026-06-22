import * as Notifications from 'expo-notifications';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  addNotificationToInbox,
  clearNotificationInbox,
  createInboxNotification,
  getUnreadCount,
  loadNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  type InboxNotification,
} from '@/lib/notification-inbox';
import {
  getPushPermissionStatus,
  isPushEnabled,
  registerForPushNotificationsAsync,
  type PushPermissionStatus,
} from '@/lib/push-notifications';

type NotificationInboxContextValue = {
  notifications: InboxNotification[];
  unreadCount: number;
  permissionStatus: PushPermissionStatus;
  pushToken: string | null;
  isRegistering: boolean;
  refreshInbox: () => Promise<void>;
  refreshPermissionStatus: () => Promise<void>;
  registerForPush: () => Promise<string | null>;
  recordNotification: (input: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    id?: string;
    read?: boolean;
  }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotificationInboxContext = createContext<NotificationInboxContextValue | null>(null);

function notificationFromExpoRequest(
  request: Notifications.NotificationRequest,
  read = false,
): InboxNotification {
  const { title, body, data } = request.content;

  return createInboxNotification({
    id: request.identifier,
    title: title ?? '通知',
    body: body ?? '',
    data: typeof data === 'object' && data ? (data as Record<string, unknown>) : undefined,
    read,
  });
}

export function NotificationInboxProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>('undetermined');
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const refreshInbox = useCallback(async () => {
    const items = await loadNotificationInbox();
    setNotifications(items);
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getPushPermissionStatus();
    setPermissionStatus(status);
  }, []);

  const registerForPush = useCallback(async () => {
    setIsRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync();
      setPushToken(token);
      await refreshPermissionStatus();
      return token;
    } finally {
      setIsRegistering(false);
    }
  }, [refreshPermissionStatus]);

  const recordNotification = useCallback(
    async (input: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
      id?: string;
      read?: boolean;
    }) => {
      const next = await addNotificationToInbox(createInboxNotification(input));
      setNotifications(next);
    },
    [],
  );

  const markRead = useCallback(async (id: string) => {
    const next = await markNotificationRead(id);
    setNotifications(next);
  }, []);

  const markAllRead = useCallback(async () => {
    const next = await markAllNotificationsRead();
    setNotifications(next);
  }, []);

  const clearAll = useCallback(async () => {
    const next = await clearNotificationInbox();
    setNotifications(next);
  }, []);

  useEffect(() => {
    refreshInbox().catch((error: unknown) => {
      console.warn('[notifications] Failed to hydrate inbox:', error);
    });

    if (!isPushEnabled()) return;

    refreshPermissionStatus().catch((error: unknown) => {
      console.warn('[notifications] Failed to read permission status:', error);
    });
    registerForPush().catch((error: unknown) => {
      console.warn('[notifications] Initial push registration failed:', error);
    });
  }, [refreshInbox, refreshPermissionStatus, registerForPush]);

  useEffect(() => {
    if (!isPushEnabled()) return;

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const item = notificationFromExpoRequest(notification.request, false);
      addNotificationToInbox(item)
        .then(setNotifications)
        .catch((error: unknown) => {
          console.warn('[notifications] Failed to store received notification:', error);
        });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const item = notificationFromExpoRequest(response.notification.request, true);
      addNotificationToInbox(item)
        .then(setNotifications)
        .catch((error: unknown) => {
          console.warn('[notifications] Failed to store opened notification:', error);
        });
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        const item = notificationFromExpoRequest(response.notification.request, true);
        return addNotificationToInbox(item).then(setNotifications);
      })
      .catch((error: unknown) => {
        console.warn('[notifications] Failed to hydrate last notification:', error);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: getUnreadCount(notifications),
      permissionStatus,
      pushToken,
      isRegistering,
      refreshInbox,
      refreshPermissionStatus,
      registerForPush,
      recordNotification,
      markRead,
      markAllRead,
      clearAll,
    }),
    [
      notifications,
      permissionStatus,
      pushToken,
      isRegistering,
      refreshInbox,
      refreshPermissionStatus,
      registerForPush,
      recordNotification,
      markRead,
      markAllRead,
      clearAll,
    ],
  );

  return (
    <NotificationInboxContext.Provider value={value}>{children}</NotificationInboxContext.Provider>
  );
}

export function useNotificationInbox() {
  const context = useContext(NotificationInboxContext);
  if (!context) {
    throw new Error('useNotificationInbox must be used within NotificationInboxProvider');
  }
  return context;
}
