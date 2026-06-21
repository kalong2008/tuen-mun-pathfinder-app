import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { PopoverAnchor } from '@/components/ui/AnimatedOverlay';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, shadows, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_MIN_WIDTH = 220;
const MENU_MAX_WIDTH = 280;
const CARET_SIZE = 10;

type GallerySelectMenuProps<T extends string> = {
  visible: boolean;
  anchor: PopoverAnchor | null;
  title: string;
  icon?: 'arrow.up.arrow.down' | 'calendar' | 'rectangle.portrait.and.arrow.right';
  value: T;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  onClose: () => void;
};

function SelectOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <ScalePressable
      onPress={onPress}
      style={[
        styles.option,
        selected && { backgroundColor: colors.primarySoft },
      ]}
    >
      <View style={styles.optionRow}>
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? colors.primary : colors.borderStrong,
              backgroundColor: selected ? colors.primary : 'transparent',
            },
          ]}
        >
          {selected ? <IconSymbol name="checkmark" size={11} color="#FFFFFF" /> : null}
        </View>
        <Text
          style={[
            styles.optionLabel,
            { color: selected ? colors.primary : colors.text },
            selected && styles.optionLabelSelected,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </ScalePressable>
  );
}

export function GallerySelectMenu<T extends string>({
  visible,
  anchor,
  title,
  icon = 'arrow.up.arrow.down',
  value,
  options,
  onSelect,
  onClose,
}: GallerySelectMenuProps<T>) {
  const { colors } = useAppTheme();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const menuScale = useSharedValue(0.94);
  const menuTranslateY = useSharedValue(-6);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      });
      menuOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      menuScale.value = withSpring(1, {
        damping: 22,
        stiffness: 380,
        mass: 0.75,
      });
      menuTranslateY.value = withSpring(0, {
        damping: 22,
        stiffness: 380,
        mass: 0.75,
      });
      return;
    }

    if (!mounted) return;

    backdropOpacity.value = withTiming(0, { duration: 140 });
    menuOpacity.value = withTiming(0, { duration: 140 });
    menuScale.value = withTiming(0.96, { duration: 140 });
    menuTranslateY.value = withTiming(
      -4,
      { duration: 140 },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [visible, mounted, backdropOpacity, menuOpacity, menuScale, menuTranslateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }, { scale: menuScale.value }],
  }));

  if (!mounted || !anchor) return null;

  const menuWidth = Math.min(
    MENU_MAX_WIDTH,
    Math.max(MENU_MIN_WIDTH, anchor.width + spacing.xl),
  );
  const anchorCenterX = anchor.x + anchor.width / 2;
  const menuLeft = Math.max(
    spacing.lg,
    Math.min(anchorCenterX - menuWidth / 2, SCREEN_WIDTH - menuWidth - spacing.lg),
  );
  const menuTop = anchor.y + anchor.height + CARET_SIZE + spacing.xs;
  const caretLeft = anchorCenterX - menuLeft - CARET_SIZE;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="關閉選單" />
        </Animated.View>

        <Animated.View
          style={[
            styles.menuWrapper,
            menuStyle,
            {
              top: menuTop,
              left: menuLeft,
              width: menuWidth,
            },
          ]}
        >
          <View
            style={[
              styles.caret,
              {
                left: caretLeft,
                borderBottomColor: colors.surface,
              },
            ]}
          />

          <View
            style={[
              styles.menu,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              shadows.md,
            ]}
          >

          <View style={[styles.header, { backgroundColor: colors.surfaceMuted }]}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>
              <IconSymbol name={icon} size={14} color={colors.primary} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          </View>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            bounces={options.length > 6}
          >
            {options.map((option) => (
              <SelectOption
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              />
            ))}
          </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  menuWrapper: {
    position: 'absolute',
  },
  menu: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 8 },
      default: {},
    }),
  },
  caret: {
    position: 'absolute',
    top: -CARET_SIZE,
    width: 0,
    height: 0,
    borderLeftWidth: CARET_SIZE,
    borderRightWidth: CARET_SIZE,
    borderBottomWidth: CARET_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.label,
    fontSize: 14,
  },
  optionsScroll: {
    maxHeight: 320,
  },
  optionsContent: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  option: {
    borderRadius: radius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  optionLabel: {
    ...typography.caption,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  optionLabelSelected: {
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
