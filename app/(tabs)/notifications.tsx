import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, type Href } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { Screen } from '@/components/ui/Screen';
import { useNotificationInbox } from '@/contexts/NotificationInboxContext';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  normalizeNotificationScreenPath,
  type InboxNotification,
} from '@/lib/notification-inbox';

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString('zh-HK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function permissionLabel(status: 'granted' | 'denied' | 'undetermined'): string {
  switch (status) {
    case 'granted':
      return '已開啟';
    case 'denied':
      return '已拒絕';
    default:
      return '尚未設定';
  }
}

function permissionDescription(status: 'granted' | 'denied' | 'undetermined'): string {
  switch (status) {
    case 'granted':
      return '您已允許接收推播通知。新通知會顯示在此列表。';
    case 'denied':
      return '請到 iOS 設定 > 通知，開啟此 App 的通知權限。';
    default:
      return '開啟通知後，可接收活動及通告更新。';
  }
}

type NotificationSection = {
  title: string;
  data: InboxNotification[];
};

function groupNotifications(notifications: InboxNotification[]): NotificationSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayItems: InboxNotification[] = [];
  const weekItems: InboxNotification[] = [];
  const older: InboxNotification[] = [];

  for (const item of notifications) {
    const received = new Date(item.receivedAt);
    received.setHours(0, 0, 0, 0);
    if (received.getTime() === today.getTime()) {
      todayItems.push(item);
    } else if (received >= weekAgo) {
      weekItems.push(item);
    } else {
      older.push(item);
    }
  }

  const sections: NotificationSection[] = [];
  if (todayItems.length > 0) sections.push({ title: '今天', data: todayItems });
  if (weekItems.length > 0) sections.push({ title: '本週', data: weekItems });
  if (older.length > 0) sections.push({ title: '較早', data: older });
  return sections;
}

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    permissionStatus,
    isRegistering,
    refreshInbox,
    refreshPermissionStatus,
    registerForPush,
    markRead,
    markAllRead,
    clearAll,
  } = useNotificationInbox();
  const [refreshing, setRefreshing] = React.useState(false);

  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshInbox(), refreshPermissionStatus()]);
    setRefreshing(false);
  }, [refreshInbox, refreshPermissionStatus]);

  const handleOpenNotification = useCallback(
    async (item: InboxNotification) => {
      if (!item.read) {
        await markRead(item.id);
      }

      const screen = item.data?.screen;
      if (typeof screen === 'string' && screen.trim()) {
        try {
          router.push(normalizeNotificationScreenPath(screen) as Href);
        } catch (error) {
          console.error('[notifications] Failed to navigate:', error);
        }
      }
    },
    [markRead, router],
  );

  const renderItem = ({ item }: { item: InboxNotification }) => (
    <ScalePressable onPress={() => handleOpenNotification(item)}>
      <Card
        style={{
          ...styles.notificationCard,
          borderColor: item.read ? colors.border : colors.primary,
          backgroundColor: item.read ? colors.surface : colors.surfaceAccent,
        }}
      >
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {!item.read ? (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          ) : null}
        </View>
        {item.body ? (
          <Text style={[styles.notificationBody, { color: colors.muted }]} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}
        <Text style={[styles.notificationTime, { color: colors.muted }]}>
          {formatTimestamp(item.receivedAt)}
        </Text>
      </Card>
    </ScalePressable>
  );

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <Text style={[styles.sectionHeader, { color: colors.muted }]}>{section.title}</Text>
  );

  return (
    <Screen scroll={false} padded={false} edges={[]}>
      <Stack.Screen options={{ title: '通知' }} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <Card style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsCopy}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>推播通知</Text>
                <Text style={[styles.settingsStatus, { color: colors.muted }]}>
                  狀態：{permissionLabel(permissionStatus)}
                </Text>
              </View>
            </View>
            <Text style={[styles.settingsDescription, { color: colors.muted }]}>
              {permissionDescription(permissionStatus)}
            </Text>
            {permissionStatus !== 'granted' ? (
              <Button
                label={isRegistering ? '設定中…' : '開啟通知'}
                onPress={() => registerForPush()}
                loading={isRegistering}
                style={styles.settingsButton}
              />
            ) : null}
            {notifications.length > 0 ? (
              <View style={styles.settingsActions}>
                {unreadCount > 0 ? (
                  <Button
                    label="全部標為已讀"
                    onPress={() => markAllRead()}
                    variant="secondary"
                    style={styles.inlineButton}
                  />
                ) : null}
                <Button
                  label="清除全部"
                  onPress={() => clearAll()}
                  variant="outline"
                  style={styles.inlineButton}
                />
              </View>
            ) : null}
          </Card>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="notifications-off-outline" size={32} color={colors.muted} />}
            title="暫無通知"
            description={
              permissionStatus === 'granted'
                ? '當有最新活動或通告更新時，通知會顯示在這裡。'
                : '開啟推播通知後，即可在此查看收到的訊息。'
            }
            actionLabel={permissionStatus !== 'granted' ? '開啟通知' : undefined}
            onAction={permissionStatus !== 'granted' ? () => registerForPush() : undefined}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    flexGrow: 1,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: {
    flex: 1,
  },
  settingsTitle: {
    ...typography.heading,
  },
  settingsStatus: {
    ...typography.caption,
    marginTop: 2,
  },
  settingsDescription: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  settingsButton: {
    marginBottom: spacing.sm,
  },
  settingsActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inlineButton: {
    flexGrow: 1,
    minWidth: 140,
  },
  sectionHeader: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  notificationCard: {
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.bodyMedium,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginTop: 6,
  },
  notificationBody: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    ...typography.small,
  },
});
