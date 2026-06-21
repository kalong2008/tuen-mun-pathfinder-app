import { BlurView } from 'expo-blur';
import { ReactNode, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, typography } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RIGHT_PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);
const POPOVER_MIN_WIDTH = 176;

export type PopoverAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OverlayBackdropProps = {
  opacity: SharedValue<number>;
  onClose: () => void;
};

function OverlayBackdrop({ opacity, onClose }: OverlayBackdropProps) {
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, backdropStyle]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="關閉">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBackdrop]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

type RightSlidePanelProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  panelStyle?: ViewStyle;
};

export function RightSlidePanel({ visible, onClose, children, panelStyle }: RightSlidePanelProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const panelTranslateX = useSharedValue(RIGHT_PANEL_WIDTH);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      panelTranslateX.value = withSpring(0, {
        damping: 26,
        stiffness: 260,
        mass: 0.9,
      });
      return;
    }

    if (!mounted) return;

    backdropOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.quad),
    });
    panelTranslateX.value = withTiming(
      RIGHT_PANEL_WIDTH,
      { duration: 240, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [visible, mounted, backdropOpacity, panelTranslateX]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panelTranslateX.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <OverlayBackdrop opacity={backdropOpacity} onClose={onClose} />
        <Animated.View
          style={[
            styles.rightPanel,
            panelAnimatedStyle,
            {
              width: RIGHT_PANEL_WIDTH,
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.lg,
            },
            panelStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

type FloatingPopoverProps = {
  visible: boolean;
  onClose: () => void;
  anchor: PopoverAnchor | null;
  title?: string;
  children: ReactNode;
};

export function FloatingPopover({
  visible,
  onClose,
  anchor,
  title,
  children,
}: FloatingPopoverProps) {
  const [mounted, setMounted] = useState(visible);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      cardOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      cardScale.value = withSpring(1, {
        damping: 20,
        stiffness: 340,
        mass: 0.7,
      });
      return;
    }

    if (!mounted) return;

    cardOpacity.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.cubic) });
    cardScale.value = withTiming(
      0.94,
      { duration: 140, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [visible, mounted, cardOpacity, cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!mounted || !anchor) return null;

  const popoverWidth = Math.max(POPOVER_MIN_WIDTH, anchor.width);
  const cardLeft = Math.max(
    spacing.lg,
    Math.min(anchor.x, SCREEN_WIDTH - popoverWidth - spacing.lg),
  );
  const cardTop = anchor.y + anchor.height + spacing.sm;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="關閉" />

        <Animated.View
          style={[
            styles.popoverCard,
            cardStyle,
            {
              top: cardTop,
              left: cardLeft,
              width: popoverWidth,
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : null}
          <View
            style={[
              styles.popoverInner,
              Platform.OS !== 'ios' && styles.popoverInnerAndroid,
            ]}
          >
            {title ? (
              <>
                <Text style={styles.popoverTitle}>{title}</Text>
                <View style={styles.popoverDivider} />
              </>
            ) : null}
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type CenterFadeSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function CenterFadeSheet({ visible, onClose, children }: CenterFadeSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(36);
  const sheetScale = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      sheetOpacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withSpring(0, {
        damping: 22,
        stiffness: 280,
        mass: 0.85,
      });
      sheetScale.value = withSpring(1, {
        damping: 20,
        stiffness: 260,
        mass: 0.85,
      });
      return;
    }

    if (!mounted) return;

    backdropOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.quad),
    });
    sheetOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });
    sheetTranslateY.value = withTiming(
      28,
      { duration: 200, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
    sheetScale.value = withTiming(0.96, { duration: 200, easing: Easing.in(Easing.cubic) });
  }, [visible, mounted, backdropOpacity, sheetOpacity, sheetTranslateY, sheetScale]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateY: sheetTranslateY.value }, { scale: sheetScale.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <OverlayBackdrop opacity={backdropOpacity} onClose={onClose} />
        <View style={styles.centerContainer} pointerEvents="box-none">
          <Animated.View style={[styles.centerSheet, sheetAnimatedStyle]}>{children}</Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  androidBackdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  rightPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: -6, height: 0 },
    elevation: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  centerSheet: {
    width: '100%',
    maxHeight: '82%',
  },
  popoverCard: {
    position: 'absolute',
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  popoverInner: {
    paddingVertical: spacing.xs,
  },
  popoverTitle: {
    ...typography.label,
    color: '#52796F',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  popoverDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: spacing.xs,
  },
  popoverInnerAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
});
