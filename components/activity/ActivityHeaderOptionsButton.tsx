import { Pressable, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { renderMenuCheckboxItem } from '@/components/menu/renderMenuCheckboxItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type {
  ActivityClubFilter,
  ActivityTimelineFilter,
  ActivityViewMode,
} from '@/lib/calendar-utils';
import {
  ACTIVITY_VIEW_MENU_OPTIONS,
  CLUB_MENU_OPTIONS,
  UPCOMING_MENU_OPTIONS,
} from '@/lib/header-menu-options';

type ActivityHeaderOptionsButtonProps = {
  club: ActivityClubFilter;
  onClubChange: (club: ActivityClubFilter) => void;
  timeline: ActivityTimelineFilter;
  onTimelineChange: (timeline: ActivityTimelineFilter) => void;
  viewMode: ActivityViewMode;
  onViewModeChange: (viewMode: ActivityViewMode) => void;
};

export function ActivityHeaderOptionsButton({
  club,
  onClubChange,
  timeline,
  onTimelineChange,
  viewMode,
  onViewModeChange,
}: ActivityHeaderOptionsButtonProps) {
  const { colors } = useAppTheme();
  const iconColor = colors.text;

  const triggerButton = (
    <Pressable
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="篩選活動"
    >
      <LiquidGlassSurface style={styles.buttonGlass} isInteractive>
        <IconSymbol name="line.3.horizontal.decrease" size={17} color={iconColor} />
      </LiquidGlassSurface>
    </Pressable>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{triggerButton}</DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {ACTIVITY_VIEW_MENU_OPTIONS.map((option) =>
            renderMenuCheckboxItem({
              itemKey: `view-${option.value}`,
              option,
              selected: viewMode === option.value,
              onSelect: onViewModeChange,
            }),
          )}
        </DropdownMenu.Group>

        {viewMode === 'list' ? (
          <>
            <DropdownMenu.Group>
              {CLUB_MENU_OPTIONS.map((option) =>
                renderMenuCheckboxItem({
                  itemKey: `club-${option.value}`,
                  option,
                  selected: club === option.value,
                  onSelect: onClubChange,
                }),
              )}
            </DropdownMenu.Group>

            <DropdownMenu.Group>
              {UPCOMING_MENU_OPTIONS.map((option) =>
                renderMenuCheckboxItem({
                  itemKey: `timeline-${option.value}`,
                  option,
                  selected: timeline === option.value,
                  onSelect: onTimelineChange,
                }),
              )}
            </DropdownMenu.Group>
          </>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  buttonGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
