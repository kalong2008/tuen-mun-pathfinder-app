import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GallerySelectMenu } from '@/components/gallery/GallerySelectMenu';
import type { PopoverAnchor } from '@/components/ui/AnimatedOverlay';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, shadows, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { GalleryViewMode } from '@/lib/gallery-utils';

export type GalleryMenuControl<T extends string = string> = {
  id: string;
  label: string;
  value: T;
  displayValue: string;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
};

type GalleryControlBarProps<T extends string = string> = {
  controls: GalleryMenuControl<T>[];
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
};

const CONTROL_ICONS: Record<
  string,
  'arrow.up.arrow.down' | 'calendar' | 'rectangle.portrait.and.arrow.right'
> = {
  sort: 'arrow.up.arrow.down',
  year: 'calendar',
  orientation: 'rectangle.portrait.and.arrow.right',
};

function SegmentedViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: GalleryViewMode;
  onViewModeChange: (mode: GalleryViewMode) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.segmentTrack,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPress={() => onViewModeChange('card')}
        style={[
          styles.segmentButton,
          viewMode === 'card' && [
            styles.segmentButtonActive,
            { backgroundColor: colors.surface },
            shadows.sm,
          ],
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'card' }}
        accessibilityLabel="卡片顯示"
      >
        <IconSymbol
          name="square.grid.2x2.fill"
          size={17}
          color={viewMode === 'card' ? colors.primary : colors.muted}
        />
      </Pressable>
      <Pressable
        onPress={() => onViewModeChange('list')}
        style={[
          styles.segmentButton,
          viewMode === 'list' && [
            styles.segmentButtonActive,
            { backgroundColor: colors.surface },
            shadows.sm,
          ],
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'list' }}
        accessibilityLabel="列表顯示"
      >
        <IconSymbol
          name="list.bullet"
          size={17}
          color={viewMode === 'list' ? colors.primary : colors.muted}
        />
      </Pressable>
    </View>
  );
}

export function GalleryControlBar<T extends string>({
  controls,
  viewMode,
  onViewModeChange,
}: GalleryControlBarProps<T>) {
  const { colors } = useAppTheme();
  const anchorRefs = useRef<Record<string, View | null>>({});
  const [openControlId, setOpenControlId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);

  const openControl = controls.find((control) => control.id === openControlId) ?? null;

  const openMenu = (controlId: string) => {
    const node = anchorRefs.current[controlId];
    node?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpenControlId(controlId);
    });
  };

  const closeMenu = () => {
    setOpenControlId(null);
  };

  return (
    <>
      <View
        style={[
          styles.toolbar,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        ]}
      >
        <View style={styles.controlsRow}>
          {controls.map((control) => {
            const isOpen = openControlId === control.id;
            const iconName = CONTROL_ICONS[control.id] ?? 'arrow.up.arrow.down';

            return (
              <View
                key={control.id}
                ref={(node) => {
                  anchorRefs.current[control.id] = node;
                }}
                style={styles.controlSlot}
                collapsable={false}
              >
                <Pressable
                  onPress={() => openMenu(control.id)}
                  style={({ pressed }) => [
                    styles.filterPill,
                    {
                      backgroundColor: isOpen ? colors.surface : 'transparent',
                      borderColor: isOpen ? colors.borderStrong : colors.border,
                    },
                    isOpen && shadows.sm,
                    pressed && styles.filterPillPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${control.label}：${control.displayValue}`}
                  accessibilityState={{ expanded: isOpen }}
                >
                  <View style={styles.filterPillRow}>
                    <IconSymbol name={iconName} size={14} color={colors.primary} />
                    <Text
                      style={[styles.filterPillValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {control.displayValue}
                    </Text>
                    <IconSymbol
                      name="chevron.down"
                      size={11}
                      color={colors.muted}
                      style={isOpen ? styles.chevronOpen : undefined}
                    />
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={[styles.toolbarDivider, { backgroundColor: colors.border }]} />

        <SegmentedViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </View>

      {openControl ? (
        <GallerySelectMenu
          visible={openControlId !== null}
          anchor={anchor}
          title={openControl.label}
          icon={CONTROL_ICONS[openControl.id]}
          value={openControl.value}
          options={openControl.options}
          onSelect={openControl.onSelect}
          onClose={closeMenu}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  controlsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  controlSlot: {
    flex: 1,
    minWidth: 0,
  },
  toolbarDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    flexShrink: 0,
  },
  filterPill: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterPillPressed: {
    opacity: 0.85,
  },
  filterPillValue: {
    ...typography.caption,
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  segmentTrack: {
    flexDirection: 'row',
    flexShrink: 0,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 2,
  },
  segmentButton: {
    width: 36,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    borderRadius: radius.sm,
  },
});
