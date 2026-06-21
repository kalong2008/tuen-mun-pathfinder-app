import { Pressable, StyleSheet, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { GallerySortOption, GalleryViewMode } from '@/lib/gallery-utils';

const SORT_OPTIONS: { value: GallerySortOption; label: string }[] = [
  { value: 'newest', label: '按最新加入' },
  { value: 'oldest', label: '按最舊加入' },
  { value: 'name', label: '按名稱' },
];

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
    { value: ALL_YEARS_VALUE, label: '全部' },
    ...availableYears.map((year) => ({
      value: String(year),
      label: `${year}年`,
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
          {SORT_OPTIONS.map((option) => (
            <DropdownMenu.CheckboxItem
              key={`sort-${option.value}`}
              value={sort === option.value}
              onValueChange={() => onSortChange(option.value)}
            >
              <DropdownMenu.ItemIndicator />
              <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>

        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="filter">
              <DropdownMenu.ItemTitle>過濾</DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              {yearOptions.map((option) => {
                const isSelected =
                  option.value === ALL_YEARS_VALUE
                    ? selectedYear === null
                    : selectedYear === Number(option.value);

                return (
                  <DropdownMenu.CheckboxItem
                    key={`year-${option.value}`}
                    value={isSelected}
                    onValueChange={() =>
                      onYearChange(option.value === ALL_YEARS_VALUE ? null : Number(option.value))
                    }
                  >
                    <DropdownMenu.ItemIndicator />
                    <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
                  </DropdownMenu.CheckboxItem>
                );
              })}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>

        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="view-options">
              <DropdownMenu.ItemTitle>顯示方式選項</DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              <DropdownMenu.CheckboxItem
                key="view-card"
                value={viewMode === 'card'}
                onValueChange={() => onViewModeChange('card')}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemIcon
                  ios={{ name: 'square.grid.2x2' }}
                  androidIconName="grid_view"
                />
                <DropdownMenu.ItemTitle>卡片</DropdownMenu.ItemTitle>
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.CheckboxItem
                key="view-list"
                value={viewMode === 'list'}
                onValueChange={() => onViewModeChange('list')}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemIcon ios={{ name: 'list.bullet' }} androidIconName="format_list_bulleted" />
                <DropdownMenu.ItemTitle>列表</DropdownMenu.ItemTitle>
              </DropdownMenu.CheckboxItem>
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
