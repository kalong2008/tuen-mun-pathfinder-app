import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, shadows, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type PreviewTag = {
  label: string;
  color: string;
};

type HomePreviewTone = 'primary' | 'secondary' | 'accent';

type HomePreviewTileProps = {
  label: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  tone?: HomePreviewTone;
  name?: string;
  date?: string;
  tags?: PreviewTag[];
  showNewBadge?: boolean;
  emptyText?: string;
  loading?: boolean;
  error?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
};

function getToneColors(tone: HomePreviewTone, colors: ReturnType<typeof useAppTheme>['colors']) {
  switch (tone) {
    case 'secondary':
      return {
        icon: colors.secondary,
        background: `${colors.secondary}1A`,
      };
    case 'accent':
      return {
        icon: colors.danger,
        background: `${colors.danger}18`,
      };
    case 'primary':
    default:
      return {
        icon: colors.primary,
        background: colors.primarySoft,
      };
  }
}

function PreviewTags({ tags }: { tags: PreviewTag[] }) {
  return (
    <View style={styles.tagRow}>
      {tags.map((tag) => (
        <View
          key={tag.label}
          style={[
            styles.tag,
            { backgroundColor: `${tag.color}22`, borderColor: `${tag.color}55` },
          ]}
        >
          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
        </View>
      ))}
    </View>
  );
}

function TileHeader({
  icon,
  label,
  tone,
  showNewBadge,
}: {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  label: string;
  tone: HomePreviewTone;
  showNewBadge: boolean;
}) {
  const { colors } = useAppTheme();
  const toneColors = getToneColors(tone, colors);

  return (
    <View style={styles.headerRow}>
      <View style={[styles.iconBadge, { backgroundColor: toneColors.background }]}>
        <IconSymbol name={icon} size={16} color={toneColors.icon} />
      </View>

      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>

      {showNewBadge ? (
        <View style={[styles.newBadge, { backgroundColor: colors.danger }]}>
          <Text style={styles.newBadgeText}>新</Text>
        </View>
      ) : null}
    </View>
  );
}

export function HomePreviewTile({
  label,
  icon,
  tone = 'primary',
  name,
  date,
  tags = [],
  showNewBadge = false,
  emptyText,
  loading = false,
  error = null,
  onPress,
  style,
}: HomePreviewTileProps) {
  const { colors } = useAppTheme();
  const hasContent = Boolean(name);
  const containerStyle = [
    styles.container,
    shadows.sm,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    style,
  ];

  const content = (
    <>
      <TileHeader
        icon={icon}
        label={label}
        tone={tone}
        showNewBadge={showNewBadge}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : hasContent ? (
        <View style={styles.body}>
          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <Text style={[styles.name, { color: colors.text }]} numberOfLines={4}>
            {name}
          </Text>

          {date || tags.length > 0 ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              {date ? (
                <Text style={[styles.date, { color: colors.muted }]} numberOfLines={1}>
                  {date}
                </Text>
              ) : (
                <View style={styles.dateSpacer} />
              )}
              {tags.length > 0 ? <PreviewTags tags={tags} /> : null}
            </View>
          ) : null}
        </View>
      ) : emptyText ? (
        <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyText}</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <ScalePressable style={containerStyle} onPress={onPress}>
        {content}
      </ScalePressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.label,
    flex: 1,
  },
  body: {
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  date: {
    ...typography.small,
    flexShrink: 1,
  },
  dateSpacer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flexShrink: 0,
  },
  tag: {
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  tagText: {
    ...typography.small,
  },
  newBadge: {
    borderRadius: radius.full,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  newBadgeText: {
    color: '#FFFFFF',
    ...typography.small,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.caption,
    paddingBottom: spacing.xs,
  },
  errorText: {
    ...typography.caption,
  },
  loader: {
    marginVertical: spacing.xs,
  },
});
