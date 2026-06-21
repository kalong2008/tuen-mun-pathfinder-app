import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

type SectionHeaderProps = {
  title: string;
  icon?: Parameters<typeof IconSymbol>[0]['name'];
  action?: ReactNode;
};

export function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <IconSymbol name={icon} size={20} color={colors.primary} /> : null}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.heading,
  },
});
