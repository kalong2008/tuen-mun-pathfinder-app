import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GalleryHeaderOptionsButton } from "@/components/gallery/GalleryHeaderOptionsButton";
import { LiquidGlassBackdrop } from "@/components/ui/LiquidGlassSurface";
import { spacing, typography } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { GallerySortOption, GalleryViewMode } from "@/lib/gallery-utils";

const TITLE_BLOCK_HEIGHT = 41 + spacing.xs + 20;

export function getGalleryPhotosHeaderHeight(topInset: number) {
  return Math.max(topInset, spacing.sm) + TITLE_BLOCK_HEIGHT + spacing.md;
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
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>相簿</Text>

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

      <Text
        style={[styles.subtitle, { color: colors.muted }]}
        numberOfLines={1}
      >
        {subtitle}
      </Text>
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
      <LiquidGlassBackdrop />
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
    overflow: "hidden",
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
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
