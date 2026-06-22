import { Pressable, StyleSheet, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { renderMenuCheckboxItem } from '@/components/menu/renderMenuCheckboxItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { GallerySortOption, GalleryViewMode } from '@/lib/gallery-utils';
import {
  FILTER_MENU_LABEL,
  GALLERY_SORT_MENU_OPTIONS,
  GALLERY_VIEW_MENU_OPTIONS,
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
  const { colors } = useAppTheme();
  const isPhotosVariant = variant === 'photos';
  const iconColor = colors.text;

  const yearOptions = [
    { value: ALL_YEARS_VALUE, label: '全部', icon: MENU_ICONS.yearAll },
    ...availableYears.map((year) => ({
      value: String(year),
      label: `${year}年`,
      icon: MENU_ICONS.year,
    })),
  ];

  const triggerButton = (
    <Pressable
      hitSlop={8}
      style={isPhotosVariant ? styles.photosButton : styles.headerButton}
      accessibilityRole="button"
      accessibilityLabel="排序、篩選與顯示"
    >
      {isPhotosVariant ? (
        <LiquidGlassSurface style={styles.photosButtonGlass} isInteractive>
          <IconSymbol name="line.3.horizontal.decrease" size={17} color={iconColor} />
        </LiquidGlassSurface>
      ) : (
        <View style={styles.headerButtonInner}>
          <IconSymbol name="line.3.horizontal.decrease.circle" size={22} color={iconColor} />
        </View>
      )}
    </Pressable>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{triggerButton}</DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {GALLERY_SORT_MENU_OPTIONS.map((option) =>
            renderMenuCheckboxItem({
              itemKey: `sort-${option.value}`,
              option,
              selected: sort === option.value,
              onSelect: onSortChange,
            }),
          )}
        </DropdownMenu.Group>

        <DropdownMenu.Group>
          {GALLERY_VIEW_MENU_OPTIONS.map((option) =>
            renderMenuCheckboxItem({
              itemKey: `view-${option.value}`,
              option,
              selected: viewMode === option.value,
              onSelect: onViewModeChange,
            }),
          )}
        </DropdownMenu.Group>

        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="filter">
              <DropdownMenu.ItemIcon
                ios={{ name: MENU_ICONS.filter.ios }}
                androidIconName={MENU_ICONS.filter.android}
              />
              <DropdownMenu.ItemTitle>{FILTER_MENU_LABEL}</DropdownMenu.ItemTitle>
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
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photosButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  photosButtonGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
