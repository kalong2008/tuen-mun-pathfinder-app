import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScalePressable } from '@/components/ui/ScalePressable';
import { Screen } from '@/components/ui/Screen';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, spacing, typography } from '@/constants/theme';
import { useNotificationInbox } from '@/contexts/NotificationInboxContext';
import { useAppTheme } from '@/hooks/useAppTheme';

type MoreItem = {
  title: string;
  subtitle: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  route: '/(tabs)/notifications' | '/(tabs)/galleries' | '/contact';
  badge?: number;
};

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { unreadCount } = useNotificationInbox();
  const { user } = useUser();
  const { signOut } = useClerk();

  const items: MoreItem[] = [
    {
      title: '通知',
      subtitle: '推播訊息收件箱',
      icon: 'bell.fill',
      route: '/(tabs)/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: '相簿',
      subtitle: '活動相片（需登入）',
      icon: 'photo.stack.fill',
      route: '/(tabs)/galleries',
    },
    {
      title: '聯絡我們',
      subtitle: '查詢及聯絡表單',
      icon: 'envelope.fill',
      route: '/contact',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: '更多' }} />

      <View style={styles.grid}>
        {items.map((item) => (
          <ScalePressable
            key={item.title}
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
              <IconSymbol name={item.icon} size={24} color={colors.primary} />
              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.itemSubtitle, { color: colors.muted }]} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </ScalePressable>
        ))}
      </View>

      <View style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SignedIn>
          <Text style={[styles.accountLabel, { color: colors.muted }]}>已登入</Text>
          <Text style={[styles.accountName, { color: colors.text }]}>
            {user?.firstName || user?.username || '會員'}
          </Text>
          <ScalePressable
            style={[styles.accountButton, { borderColor: colors.border }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.accountButtonText, { color: colors.danger }]}>登出</Text>
          </ScalePressable>
        </SignedIn>
        <SignedOut>
          <Text style={[styles.accountLabel, { color: colors.muted }]}>會員功能</Text>
          <Text style={[styles.accountHint, { color: colors.text }]}>
            登入後可瀏覽活動相簿
          </Text>
          <ScalePressable
            style={[styles.accountButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() =>
              router.push(`/(auth)/sign-in?redirect_url=${encodeURIComponent('/(tabs)/more')}`)
            }
          >
            <Text style={[styles.accountButtonText, { color: '#FFFFFF' }]}>登入</Text>
          </ScalePressable>
        </SignedOut>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    minHeight: 140,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  itemTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
  },
  itemSubtitle: {
    ...typography.caption,
  },
  accountCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  accountLabel: {
    ...typography.label,
  },
  accountName: {
    ...typography.heading,
  },
  accountHint: {
    ...typography.body,
  },
  accountButton: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  accountButtonText: {
    ...typography.bodyMedium,
  },
});
