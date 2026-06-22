import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityHeaderOptionsButton } from '@/components/activity/ActivityHeaderOptionsButton';
import { LiquidGlassBackdrop } from '@/components/ui/LiquidGlassSurface';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type {
  ActivityClubFilter,
  ActivityTimelineFilter,
  ActivityViewMode,
} from '@/lib/calendar-utils';

const TITLE_BLOCK_HEIGHT = 41;

export function getActivityHeaderHeight(topInset: number) {
  return Math.max(topInset, spacing.sm) + TITLE_BLOCK_HEIGHT + spacing.md;
}

type ActivityHeaderProps = {
  sticky?: boolean;
  onLayout?: (height: number) => void;
  showOptions?: boolean;
  club?: ActivityClubFilter;
  onClubChange?: (club: ActivityClubFilter) => void;
  timeline?: ActivityTimelineFilter;
  onTimelineChange?: (timeline: ActivityTimelineFilter) => void;
  viewMode?: ActivityViewMode;
  onViewModeChange?: (viewMode: ActivityViewMode) => void;
};

export function ActivityHeader({
  sticky = false,
  onLayout,
  showOptions = false,
  club,
  onClubChange,
  timeline,
  onTimelineChange,
  viewMode,
  onViewModeChange,
}: ActivityHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.sm);
  const canShowOptions =
    showOptions &&
    club !== undefined &&
    onClubChange !== undefined &&
    timeline !== undefined &&
    onTimelineChange !== undefined &&
    viewMode !== undefined &&
    onViewModeChange !== undefined;

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event.nativeEvent.layout.height);
  };

  const content = (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.text }]}>活動</Text>
      </View>

      {canShowOptions ? (
        <ActivityHeaderOptionsButton
          club={club}
          onClubChange={onClubChange}
          timeline={timeline}
          onTimelineChange={onTimelineChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      ) : (
        <View style={styles.optionsPlaceholder} />
      )}
    </View>
  );

  if (!sticky) {
    return (
      <View
        onLayout={handleLayout}
        style={[
          styles.container,
          {
            paddingTop,
            backgroundColor: colors.background,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <View
      pointerEvents="box-none"
      onLayout={handleLayout}
      style={[styles.stickyWrapper, { paddingTop }]}
    >
      <LiquidGlassBackdrop />
      <View style={styles.container}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: Platform.OS === 'ios' ? 0.37 : 0,
  },
  optionsPlaceholder: {
    width: 36,
    height: 36,
  },
});
