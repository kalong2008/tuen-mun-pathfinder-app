import { Platform, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { FilterMenuTriggerButton } from '@/components/menu/FilterMenuTriggerButton';
import {
  FilterDropdownMenu,
  renderMenuCheckboxGroup,
} from '@/components/menu/renderMenuCheckboxGroup';
import { renderMenuCheckboxItem } from '@/components/menu/renderMenuCheckboxItem';
import type { GallerySortOption, GalleryViewMode } from '@/lib/gallery-utils';
import {
  GALLERY_SORT_MENU_OPTIONS,
  GALLERY_VIEW_MENU_OPTIONS,
  MENU_GROUP_LABELS,
  MENU_ICONS,
} from '@/lib/header-menu-options';

const ALL_YEARS_VALUE = 'all';

type GalleryHeaderOptionsButtonProps = {
  variant?: 'default' | 'photos';
  sort: GallerySortOption;
  onSortChange: (sort: GallerySortOption) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  availableYears: number[];
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
};

export function GalleryHeaderOptionsButton({
  variant = 'default',
  sort,
  onSortChange,
  selectedYear,
  onYearChange,
  availableYears,
  viewMode,
  onViewModeChange,
}: GalleryHeaderOptionsButtonProps) {
  const isPhotosVariant = variant === 'photos';

  const yearOptions = [
    { value: ALL_YEARS_VALUE, label: '全部', icon: MENU_ICONS.yearAll },
    ...availableYears.map((year) => ({
      value: String(year),
      label: `${year}年`,
      icon: MENU_ICONS.year,
    })),
  ];

  const triggerButton = (
    <FilterMenuTriggerButton
      accessibilityLabel="排序、篩選與顯示"
      iconName={
        isPhotosVariant
          ? 'line.3.horizontal.decrease'
          : 'line.3.horizontal.decrease.circle'
      }
      iconSize={isPhotosVariant ? 17 : 22}
      style={isPhotosVariant ? undefined : styles.headerButton}
      variant={isPhotosVariant ? 'glass' : 'plain'}
    />
  );

  const yearMenu =
    Platform.OS === 'android' ? (
      renderMenuCheckboxGroup({
        groupKey: 'year',
        label: MENU_GROUP_LABELS.year,
        options: yearOptions,
        isSelected: (value) =>
          value === ALL_YEARS_VALUE
            ? selectedYear === null
            : selectedYear === Number(value),
        onSelect: (value) =>
          onYearChange(value === ALL_YEARS_VALUE ? null : Number(value)),
        showSeparator: true,
      })
    ) : (
      <>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>{MENU_GROUP_LABELS.year}</DropdownMenu.Label>
        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="filter">
              <DropdownMenu.ItemIcon
                ios={{ name: MENU_ICONS.filter.ios }}
                androidIconName={MENU_ICONS.filter.android}
              />
              <DropdownMenu.ItemTitle>
                {selectedYear === null ? '全部' : `${selectedYear}年`}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              {yearOptions.map((option) => {
                const isSelected =
                  option.value === ALL_YEARS_VALUE
                    ? selectedYear === null
                    : selectedYear === Number(option.value);

                return renderMenuCheckboxItem({
                  itemKey: `year-${option.value}`,
                  option,
                  selected: isSelected,
                  onSelect: (value) =>
                    onYearChange(value === ALL_YEARS_VALUE ? null : Number(value)),
                });
              })}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>
      </>
    );

  return (
    <FilterDropdownMenu
      trigger={triggerButton}
      rootStyle={isPhotosVariant ? undefined : styles.androidMenuRoot}
    >
      {renderMenuCheckboxGroup({
        groupKey: 'sort',
        label: MENU_GROUP_LABELS.sort,
        options: GALLERY_SORT_MENU_OPTIONS,
        isSelected: (value) => sort === value,
        onSelect: onSortChange,
      })}
      {renderMenuCheckboxGroup({
        groupKey: 'view',
        label: MENU_GROUP_LABELS.view,
        options: GALLERY_VIEW_MENU_OPTIONS,
        isSelected: (value) => viewMode === value,
        onSelect: onViewModeChange,
        showSeparator: true,
      })}
      {yearMenu}
    </FilterDropdownMenu>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidMenuRoot: {
    width: 44,
    height: 44,
  },
});
