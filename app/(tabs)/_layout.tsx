import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AppLogo } from '@/components/AppLogo';
import { HomeHeaderActions } from '@/components/HomeHeader';
import { HomeMenuDrawer } from '@/components/HomeMenuDrawer';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { spacing } from '@/constants/theme';
import { useNotificationInbox } from '@/contexts/NotificationInboxContext';
import { useAppTheme } from '@/hooks/useAppTheme';

function TabIcon({
  filledName,
  outlineName,
  color,
  focused,
}: {
  filledName: Parameters<typeof IconSymbol>[0]['name'];
  outlineName: Parameters<typeof IconSymbol>[0]['name'];
  color: string;
  focused: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: colors.primarySoft }]}>
      <IconSymbol
        size={22}
        name={focused ? filledName : outlineName}
        color={focused ? colors.primary : color}
      />
    </View>
  );
}

function TabLayout() {
  const { colors } = useAppTheme();
  const { unreadCount } = useNotificationInbox();

  return (
    <HomeMenuDrawer>
      <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleAlign: 'center',
            headerTitleStyle: styles.headerTitle,
            tabBarButton: HapticTab,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.tabBarBorder,
              borderTopWidth: StyleSheet.hairlineWidth,
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingTop: spacing.xs,
            },
            tabBarLabelStyle: styles.tabLabel,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: '',
              headerTitle: '',
              headerLeft: () => <AppLogo />,
              headerRight: () => <HomeHeaderActions />,
              headerLeftContainerStyle: styles.homeHeaderSide,
              headerRightContainerStyle: styles.homeHeaderSide,
              tabBarLabel: '首頁',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  filledName="house.fill"
                  outlineName="house"
                  color={String(color)}
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: '活動',
              tabBarLabel: '活動',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  filledName="calendar.circle.fill"
                  outlineName="calendar"
                  color={String(color)}
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="notice"
            options={{
              title: '通告',
              tabBarLabel: '通告',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  filledName="doc.text.fill"
                  outlineName="doc.text"
                  color={String(color)}
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="galleries"
            options={{
              title: '相簿',
              tabBarLabel: '相簿',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  filledName="photo.stack.fill"
                  outlineName="photo.stack"
                  color={String(color)}
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: '通知',
              tabBarLabel: '通知',
              tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  filledName="bell.fill"
                  outlineName="bell"
                  color={String(color)}
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen name="more" options={{ href: null }} />
        </Tabs>
    </HomeMenuDrawer>
  );
}

const styles = StyleSheet.create({
  homeHeaderSide: {
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabLayout;
