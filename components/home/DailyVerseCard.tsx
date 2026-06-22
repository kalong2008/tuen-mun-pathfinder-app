import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, shadows, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type DailyVerseCardProps = {
  passage?: string;
  citation?: string;
  version?: string;
  loading?: boolean;
  error?: string | null;
  style?: ViewStyle;
};

export function DailyVerseCard({
  passage,
  citation,
  version,
  loading = false,
  error,
  style,
}: DailyVerseCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.accentBar,
          { backgroundColor: colors.primary },
        ]}
      />

      <View
        style={[
          styles.content,
          {
            backgroundColor: colors.primarySoft,
            experimental_backgroundImage: `linear-gradient(135deg, ${colors.primarySoft} 0%, ${colors.surface} 72%)`,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.labelPill, { backgroundColor: `${colors.primary}20` }]}>
            <IconSymbol name="book.fill" size={14} color={colors.primary} />
            <Text style={[styles.labelText, { color: colors.primary }]}>今日經文</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            {error ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            ) : null}

            <Text style={[styles.openQuote, { color: `${colors.primary}44` }]}>“</Text>
            <Text style={[styles.passage, { color: colors.text }]} numberOfLines={4}>
              {passage}
            </Text>
            <Text style={[styles.closeQuote, { color: `${colors.primary}44` }]}>”</Text>

            <View style={[styles.footerRule, { backgroundColor: colors.border }]} />

            <View style={styles.footer}>
              <Text style={[styles.citation, { color: colors.text }]}>{citation}</Text>
              {version ? (
                <Text style={[styles.version, { color: colors.muted }]}>{version}</Text>
              ) : null}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  labelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  labelText: {
    ...typography.label,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  openQuote: {
    fontSize: 40,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: -spacing.sm,
  },
  passage: {
    ...typography.bodyMedium,
    lineHeight: 28,
    paddingHorizontal: spacing.xs,
  },
  closeQuote: {
    fontSize: 40,
    lineHeight: 32,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  footerRule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  citation: {
    ...typography.bodyMedium,
    flex: 1,
  },
  version: {
    ...typography.caption,
  },
});
