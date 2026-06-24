import { FilterMenuTriggerButton } from '@/components/menu/FilterMenuTriggerButton';
import {
  FilterDropdownMenu,
  renderMenuCheckboxGroup,
} from '@/components/menu/renderMenuCheckboxGroup';
import {
  CLUB_MENU_OPTIONS,
  MENU_GROUP_LABELS,
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
  const triggerButton = (
    <FilterMenuTriggerButton
      accessibilityLabel="篩選通告"
      iconName="line.3.horizontal.decrease"
    />
  );

  return (
    <FilterDropdownMenu trigger={triggerButton}>
      {renderMenuCheckboxGroup({
        groupKey: 'club',
        label: MENU_GROUP_LABELS.club,
        options: CLUB_MENU_OPTIONS,
        isSelected: (value) => club === value,
        onSelect: (value) => onClubChange(value as NoticeClubFilter),
      })}
      {renderMenuCheckboxGroup({
        groupKey: 'timeline',
        label: MENU_GROUP_LABELS.timeline,
        options: NOTICE_TIMELINE_MENU_OPTIONS,
        isSelected: (value) => timeline === value,
        onSelect: onTimelineChange,
        showSeparator: true,
      })}
    </FilterDropdownMenu>
  );
}
