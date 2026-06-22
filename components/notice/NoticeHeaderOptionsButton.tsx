import { Pressable, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { NoticeClubFilter, NoticeTimelineFilter } from '@/lib/notice-utils';

const CLUB_OPTIONS: { value: NoticeClubFilter; label: string }[] = [
  { value: 'all', label: '所有' },
  { value: 'pathfinder', label: '前鋒會' },
  { value: 'adventurer', label: '幼鋒會' },
];

const TIMELINE_OPTIONS: { value: NoticeTimelineFilter; label: string }[] = [
  { value: 'active', label: '即將舉行' },
  { value: 'past', label: '較早通告' },
];

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
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="club-filter">
              <DropdownMenu.ItemTitle>對象</DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              {CLUB_OPTIONS.map((option) => (
                <DropdownMenu.CheckboxItem
                  key={`club-${option.value}`}
                  value={club === option.value}
                  onValueChange={() => onClubChange(option.value)}
                >
                  <DropdownMenu.ItemIndicator />
                  <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>

        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="timeline-filter">
              <DropdownMenu.ItemTitle>狀態</DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              {TIMELINE_OPTIONS.map((option) => (
                <DropdownMenu.CheckboxItem
                  key={`timeline-${option.value}`}
                  value={timeline === option.value}
                  onValueChange={() => onTimelineChange(option.value)}
                >
                  <DropdownMenu.ItemIndicator />
                  <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
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
