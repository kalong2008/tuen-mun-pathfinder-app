import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ActivitiesByDate } from '@/lib/calendar-utils';
import {
  expandNoticeTargets,
  getClubShortLabel,
  getNoticeActivityName,
  getNoticeDisplayDate,
  isPastNotice,
  type NoticeItem,
} from '@/lib/notice-utils';
import { getSingleTargetColor, getTargetColor } from '@/lib/target-colors';

type NoticeListItemProps = {
  notice: NoticeItem;
  onPress: () => void;
  activities?: ActivitiesByDate;
  /** Home preview uses a tighter layout without activity type. */
  variant?: 'full' | 'preview';
  style?: ViewStyle;
};

function NoticeTargetTags({ targets, past }: { targets: string[]; past: boolean }) {
  const expandedTargets = expandNoticeTargets(targets);

  return (
    <View style={styles.tagRow}>
      {expandedTargets.map((target) => {
        const color = getSingleTargetColor(target, past);
        return (
          <View
            key={target}
            style={[
              styles.tag,
              { backgroundColor: `${color}22`, borderColor: `${color}55` },
            ]}
          >
            <Text style={[styles.tagText, { color }]}>{getClubShortLabel(target)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export const NoticeListItem = React.memo(function NoticeListItem({
  notice,
  onPress,
  activities,
  variant = 'full',
  style,
}: NoticeListItemProps) {
  const { colors } = useAppTheme();
  const past = isPastNotice(notice.date);
  const accentColor = getTargetColor(notice.target, past);
  const activityName = getNoticeActivityName(notice);
  const displayDate = getNoticeDisplayDate(notice, activities, {
    includeYear: variant === 'full',
  });

  return (
    <ScalePressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: accentColor,
          opacity: past ? 0.72 : 1,
        },
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.titleRow}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={variant === 'preview' ? 2 : 1}
        >
          {activityName}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
          {displayDate}
        </Text>
        <NoticeTargetTags targets={notice.target} past={past} />
      </View>
    </ScalePressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: {
    ...typography.bodyMedium,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    ...typography.small,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  tag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  tagText: {
    ...typography.small,
  },
});
