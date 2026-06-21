import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPageLayout } from '@/components/MenuPageLayout';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type SettingsRowProps = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  hint?: string;
  onPress?: () => void;
};

function SettingsRow({ icon, label, hint, onPress }: SettingsRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        onPress && pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: colors.primarySoft }]}>
        <IconSymbol name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.settingsCopy}>
        <Text style={[styles.settingsLabel, { color: colors.text }]}>{label}</Text>
        {hint ? (
          <Text style={[styles.settingsHint, { color: colors.muted }]}>{hint}</Text>
        ) : null}
      </View>
      {onPress ? <IconSymbol name="chevron.right" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
      return;
    }
    Linking.openSettings();
  };

  return (
    <MenuPageLayout route="/settings" title="設定">
      <Screen scroll={false} padded edges={[]}>
        <View style={styles.section}>
          <SectionHeader title="一般" icon="gearshape.fill" />
          <Card style={styles.settingsCard}>
            <SettingsRow
              icon="bell.fill"
              label="推播通知"
              hint="管理通知權限及收件箱"
              onPress={() => router.push('/(tabs)/notifications')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="gearshape.fill"
              label="系統設定"
              hint="在裝置設定中管理 App 權限"
              onPress={openSystemSettings}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="關於 App" icon="info.circle.fill" />
          <Card>
            <Text style={[styles.appName, { color: colors.text }]}>屯門前鋒會</Text>
            <Text style={[styles.versionText, { color: colors.muted }]}>版本 {appVersion}</Text>
          </Card>
        </View>
      </Screen>
    </MenuPageLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  settingsCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsLabel: {
    ...typography.bodyMedium,
  },
  settingsHint: {
    ...typography.caption,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
  },
  appName: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  versionText: {
    ...typography.caption,
  },
});
