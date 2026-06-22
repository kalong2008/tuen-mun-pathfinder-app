import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, shadows, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type HomeQuickCardBadge = {
  label: string;
  color: string;
};

type HomeQuickCardProps = {
  variant: 'notice' | 'activity';
  title?: string;
  subtitle?: string;
  emptyText: string;
  badges?: HomeQuickCardBadge[];
  onPress: () => void;
  style?: ViewStyle;
};

const VARIANT_CONFIG = {
  notice: {
    label: '最新通告',
    icon: 'bell.fill' as const,
    accentKey: 'danger' as const,
  },
  activity: {
    label: '下一活動',
    icon: 'calendar.circle.fill' as const,
    accentKey: 'secondary' as const,
  },
};

export function HomeQuickCard({
  variant,
  title,
  subtitle,
  emptyText,
  badges = [],
  onPress,
  style,
}: HomeQuickCardProps) {
  const { colors } = useAppTheme();
  const config = VARIANT_CONFIG[variant];
  const accentColor = colors[config.accentKey];
  const hasContent = Boolean(title);

  return (
    <ScalePressable style={[styles.wrapper, style]} onPress={onPress}>
      <View
        style={[
          styles.container,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View
          style={[
            styles.content,
            {
              backgroundColor: `${accentColor}18`,
              experimental_backgroundImage: `linear-gradient(160deg, ${accentColor}22 0%, ${colors.surface} 78%)`,
            },
          ]}
        >
          <View style={[styles.labelPill, { backgroundColor: `${accentColor}24` }]}>
            <IconSymbol name={config.icon} size={14} color={accentColor} />
            <Text style={[styles.labelText, { color: accentColor }]}>{config.label}</Text>
          </View>

          {hasContent ? (
            <>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {title}
              </Text>

              <View style={styles.spacer} />

              <View style={[styles.footerRule, { backgroundColor: colors.border }]} />

              <View style={styles.footer}>
                <View style={styles.footerCopy}>
                  {subtitle ? (
                    <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  ) : null}
                  {badges.length > 0 ? (
                    <View style={styles.badges}>
                      {badges.map((badge) => (
                        <Badge key={badge.label} label={badge.label} color={badge.color} />
                      ))}
                    </View>
                  ) : null}
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyText}</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          )}
        </View>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  container: {
    flex: 1,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    minHeight: 148,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  labelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  labelText: {
    ...typography.label,
  },
  title: {
    ...typography.bodyMedium,
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.sm,
  },
  footerRule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  footerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  emptyState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    flex: 1,
  },
});
