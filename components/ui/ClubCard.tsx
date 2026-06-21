import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, TARGET_COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type ClubCardProps = {
  title: string;
  description: string;
  accent: keyof typeof TARGET_COLORS;
};

export function ClubCard({ title, description, accent }: ClubCardProps) {
  const { colors } = useAppTheme();
  const accentColor = TARGET_COLORS[accent];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerText: {
    ...typography.heading,
    color: '#FFFFFF',
  },
  body: {
    ...typography.body,
    padding: spacing.lg,
  },
});
