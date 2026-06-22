import { Pressable, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { renderMenuCheckboxItem } from '@/components/menu/renderMenuCheckboxItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  CLUB_MENU_OPTIONS,
  NOTICE_TIMELINE_MENU_OPTIONS,
} from '@/lib/header-menu-options';
import type { NoticeClubFilter, NoticeTimelineFilter } from '@/lib/notice-utils';

type NoticeHeaderOptionsButtonProps = {
  club: NoticeClubFilter;
  onClubChange: (club: NoticeClubFilter) => void;
  timeline: NoticeTimelineFilter;
  onTimelineChange: (timeline: NoticeTimelineFilter) => void;
};

export function NoticeHeaderOptionsButton({
  club,
  onClubChange,
  timeline,
  onTimelineChange,
}: NoticeHeaderOptionsButtonProps) {
  const { colors } = useAppTheme();
  const iconColor = colors.text;

  const triggerButton = (
    <Pressable
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="篩選通告"
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
          {NOTICE_TIMELINE_MENU_OPTIONS.map((option) =>
            renderMenuCheckboxItem({
              itemKey: `timeline-${option.value}`,
              option,
              selected: timeline === option.value,
              onSelect: onTimelineChange,
            }),
          )}
        </DropdownMenu.Group>
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
