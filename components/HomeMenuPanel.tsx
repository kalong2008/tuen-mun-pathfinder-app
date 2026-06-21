import { type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, spacing, typography } from '@/constants/theme';
import { useHomeMenu } from '@/contexts/HomeMenuContext';
import { useAppTheme } from '@/hooks/useAppTheme';

type SlideMenuItemConfig = {
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  route: Href;
};

const SLIDE_MENU_ITEMS: SlideMenuItemConfig[] = [
  { label: '關於我們', icon: 'info.circle.fill', route: '/about' },
  { label: '聯絡我們', icon: 'envelope.fill', route: '/contact' },
  { label: '設定', icon: 'gearshape.fill', route: '/settings' },
];

function SlideMenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.slideMenuItem,
        { backgroundColor: pressed ? colors.surface : 'transparent' },
      ]}
    >
      <View style={[styles.slideMenuIcon, { backgroundColor: colors.primarySoft }]}>
        <IconSymbol name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.slideMenuItemText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function HomeMenuPanel() {
  const { colors } = useAppTheme();
  const { closeNav, navigateFromMenu } = useHomeMenu();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceMuted,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.panelHeader}>
        <AppLogo />
        <Pressable
          onPress={closeNav}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="關閉選單"
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <IconSymbol name="xmark" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.slideMenuList}>
        {SLIDE_MENU_ITEMS.map((item) => (
          <SlideMenuItem
            key={item.route.toString()}
            label={item.label}
            icon={item.icon}
            onPress={() => navigateFromMenu(item.route)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  slideMenuList: {
    gap: spacing.xs,
  },
  slideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  slideMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideMenuItemText: {
    ...typography.bodyMedium,
    flex: 1,
  },
});
