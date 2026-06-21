import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { HomeMenuDrawer } from '@/components/HomeMenuDrawer';
import {
  TabBarScrollDirectionProvider,
  useTabBarScrollDirection,
} from '@/contexts/TabBarScrollDirectionContext';
import { useNotificationInbox } from '@/contexts/NotificationInboxContext';
import { useAppTheme } from '@/hooks/useAppTheme';

function TabsLayoutContent() {
  const { colors } = useAppTheme();
  const { unreadCount } = useNotificationInbox();
  const { isScrollingUp } = useTabBarScrollDirection();
  const notificationBadge =
    unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : undefined;

  return (
    <NativeTabs
      tintColor={colors.primary}
      minimizeBehavior={isScrollingUp ? 'never' : 'onScrollDown'}
      sidebarAdaptable={false}
      disableTransparentOnScrollEdge={false}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>首頁</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>活動</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar.circle.fill' }}
          md={{ default: 'calendar_today', selected: 'calendar_today' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notice">
        <NativeTabs.Trigger.Label>通告</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'doc.text', selected: 'doc.text.fill' }}
          md={{ default: 'description', selected: 'description' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="galleries">
        <NativeTabs.Trigger.Label>相簿</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'photo.stack', selected: 'photo.stack.fill' }}
          md={{ default: 'photo_library', selected: 'photo_library' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Label>通知</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bell', selected: 'bell.fill' }}
          md={{ default: 'notifications', selected: 'notifications' }}
        />
        {notificationBadge ? (
          <NativeTabs.Trigger.Badge>{notificationBadge}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  return (
    <HomeMenuDrawer>
      <TabBarScrollDirectionProvider>
        <TabsLayoutContent />
      </TabBarScrollDirectionProvider>
    </HomeMenuDrawer>
  );
}
