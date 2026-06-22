import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  getActivityClubBadges,
  getActivityDisplayName,
  isPastCombinedActivity,
  isRecurringMeeting,
  parseActivityClub,
  type CombinedActivity,
} from '@/lib/calendar-utils';
import { getClubShortLabel } from '@/lib/notice-utils';

function getActivityAccentColor(club: ReturnType<typeof parseActivityClub>, past: boolean) {
  if (past) return '#94A3B8';
  if (!club) return TARGET_COLORS.BOTH;

  switch (club) {
    case 'PATHFINDER':
      return TARGET_COLORS.PATHFINDER;
    case 'ADVENTURER':
      return TARGET_COLORS.ADVENTURER;
    case 'BOTH':
      return TARGET_COLORS.BOTH;
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

function ActivityClubTags({
  club,
  past,
}: {
  club: ReturnType<typeof parseActivityClub>;
  past: boolean;
}) {
  if (!club) return null;

  const badges = getActivityClubBadges(club);

  return (
    <View style={styles.tagRow}>
      {badges.map((badge) => {
        const color = getActivityAccentColor(badge.club, past);
        return (
          <View
            key={badge.club}
            style={[
              styles.tag,
              { backgroundColor: `${color}22`, borderColor: `${color}55` },
            ]}
          >
            <Text style={[styles.tagText, { color }]}>
              {getClubShortLabel(badge.label)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type ActivityListItemProps = {
  item: CombinedActivity;
  onPress?: () => void;
  style?: ViewStyle;
};

export const ActivityListItem = React.memo(function ActivityListItem({
  item,
  onPress,
  style,
}: ActivityListItemProps) {
  const { colors } = useAppTheme();
  const past = isPastCombinedActivity(item);
  const club = parseActivityClub(item.activity.title);
  const accentColor = getActivityAccentColor(club, past);
  const displayName = getActivityDisplayName(item.activity.title);
  const isMeeting = isRecurringMeeting(item.activity);
  const isCamp = Boolean(item.activity.isCamp);
  const metaParts = [item.dateLabel, item.activity.time, item.activity.location].filter(Boolean);
  const metaText = metaParts.join(' · ');

  const content = (
    <>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {displayName}
        </Text>
        {onPress ? (
          <IconSymbol name="chevron.right" size={14} color={colors.muted} />
        ) : null}
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={2}>
          {metaText}
        </Text>
        <View style={styles.badgeRow}>
          {isCamp ? (
            <View
              style={[
                styles.typeTag,
                {
                  backgroundColor: `${colors.primary}22`,
                  borderColor: `${colors.primary}55`,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>宿營</Text>
            </View>
          ) : null}
          {isMeeting ? (
            <View
              style={[
                styles.typeTag,
                {
                  backgroundColor: `${colors.muted}22`,
                  borderColor: `${colors.border}`,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.muted }]}>每週</Text>
            </View>
          ) : null}
          <ActivityClubTags club={club} past={past} />
        </View>
      </View>
    </>
  );

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderLeftColor: accentColor,
      opacity: past ? 0.72 : 1,
    },
    style,
  ];

  if (onPress) {
    return (
      <ScalePressable style={containerStyle} onPress={onPress}>
        {content}
      </ScalePressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
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
    gap: spacing.xs,
  },
  meta: {
    ...typography.small,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  typeTag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  tagText: {
    ...typography.small,
  },
});
