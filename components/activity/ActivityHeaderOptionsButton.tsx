import { FilterMenuTriggerButton } from '@/components/menu/FilterMenuTriggerButton';
import {
  FilterDropdownMenu,
  renderMenuCheckboxGroup,
} from '@/components/menu/renderMenuCheckboxGroup';
import type {
  ActivityClubFilter,
  ActivityTimelineFilter,
  ActivityViewMode,
} from '@/lib/calendar-utils';
import {
  ACTIVITY_VIEW_MENU_OPTIONS,
  CLUB_MENU_OPTIONS,
  MENU_GROUP_LABELS,
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
  const triggerButton = (
    <FilterMenuTriggerButton
      accessibilityLabel="篩選活動"
      iconName="line.3.horizontal.decrease"
    />
  );

  return (
    <FilterDropdownMenu trigger={triggerButton}>
      {renderMenuCheckboxGroup({
        groupKey: 'view',
        label: MENU_GROUP_LABELS.view,
        options: ACTIVITY_VIEW_MENU_OPTIONS,
        isSelected: (value) => viewMode === value,
        onSelect: onViewModeChange,
      })}

      {viewMode === 'list' ? (
        <>
          {renderMenuCheckboxGroup({
            groupKey: 'club',
            label: MENU_GROUP_LABELS.club,
            options: CLUB_MENU_OPTIONS,
            isSelected: (value) => club === value,
            onSelect: onClubChange,
            showSeparator: true,
          })}
          {renderMenuCheckboxGroup({
            groupKey: 'timeline',
            label: MENU_GROUP_LABELS.timeline,
            options: UPCOMING_MENU_OPTIONS,
            isSelected: (value) => timeline === value,
            onSelect: onTimelineChange,
            showSeparator: true,
          })}
        </>
      ) : null}
    </FilterDropdownMenu>
  );
}
