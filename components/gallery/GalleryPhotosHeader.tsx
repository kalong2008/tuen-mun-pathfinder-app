import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GalleryHeaderOptionsButton } from "@/components/gallery/GalleryHeaderOptionsButton";
import {
  GRADUAL_GLASS_FADE_HEIGHT,
  GradualLiquidGlassBackdrop,
} from "@/components/ui/LiquidGlassSurface";
import { spacing, typography } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { GallerySortOption, GalleryViewMode } from "@/lib/gallery-utils";

const TITLE_BLOCK_HEIGHT = 41 + spacing.xs + 20;

export function getGalleryPhotosHeaderHeight(topInset: number) {
  return Math.max(topInset, spacing.sm) + TITLE_BLOCK_HEIGHT;
}

export type GalleryHeaderContentInsetConfig = {
  /** Subtracted from measured/estimated header height (switch profile). */
  fadeHeight: number;
  /**
   * Initial profile (ratio < 1): target inset as a fraction of header height.
   * Switch profile (ratio > 1): minimum inset floor combined with fade overlap.
   */
  minHeightRatio: number;
};

/** First load / card view — minHeightRatio is the target inset fraction. */
export const GALLERY_HEADER_CONTENT_INSET_INITIAL: GalleryHeaderContentInsetConfig =
  {
    fadeHeight: GRADUAL_GLASS_FADE_HEIGHT,
    minHeightRatio: 1.11,
  };

/** After switching card ↔ list (FlatList remounts with measured header height). */
export const GALLERY_HEADER_CONTENT_INSET_VIEW_SWITCH: GalleryHeaderContentInsetConfig =
  {
    fadeHeight: GRADUAL_GLASS_FADE_HEIGHT,
    minHeightRatio: 1.11,
  };

/** List top spacer height for the active inset profile. */
export function getGalleryPhotosHeaderContentInset(
  headerHeight: number,
  config: GalleryHeaderContentInsetConfig,
) {
  const fadeInset = headerHeight - config.fadeHeight;
  const ratioInset = headerHeight * config.minHeightRatio;

  if (config.minHeightRatio < 1) {
    return ratioInset;
  }

  return Math.max(fadeInset, ratioInset);
}

type GalleryPhotosHeaderProps = {
  subtitle: string;
  sticky?: boolean;
  onLayout?: (height: number) => void;
  showOptions?: boolean;
  sort?: GallerySortOption;
  onSortChange?: (sort: GallerySortOption) => void;
  selectedYear?: number | null;
  onYearChange?: (year: number | null) => void;
  availableYears?: number[];
  viewMode?: GalleryViewMode;
  onViewModeChange?: (mode: GalleryViewMode) => void;
};

export function GalleryPhotosHeader({
  subtitle,
  sticky = false,
  onLayout,
  showOptions = false,
  sort,
  onSortChange,
  selectedYear,
  onYearChange,
  availableYears,
  viewMode,
  onViewModeChange,
}: GalleryPhotosHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.sm);
  const canShowOptions =
    showOptions &&
    sort !== undefined &&
    onSortChange !== undefined &&
    selectedYear !== undefined &&
    onYearChange !== undefined &&
    availableYears !== undefined &&
    viewMode !== undefined &&
    onViewModeChange !== undefined;

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event.nativeEvent.layout.height);
  };

  const content = (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.text }]}>相簿</Text>
        <Text
          style={[styles.subtitle, { color: colors.muted }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {canShowOptions ? (
        <GalleryHeaderOptionsButton
          variant="photos"
          sort={sort}
          onSortChange={onSortChange}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          availableYears={availableYears}
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
      <GradualLiquidGlassBackdrop />
      <View style={styles.container}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 41,
    letterSpacing: Platform.OS === "ios" ? 0.37 : 0,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
  },
  optionsPlaceholder: {
    width: 36,
    height: 36,
  },
});
