import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type FormSheetHeaderProps = {
  title: string;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

export function FormSheetHeader({
  title,
  onClose,
  style,
  backgroundColor,
}: FormSheetHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const sheetBackground = backgroundColor ?? colors.background;

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.androidContainer,
          {
            backgroundColor: sheetBackground,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
          },
          style,
        ]}
      >
        <View style={[styles.androidHandle, { backgroundColor: colors.borderStrong }]} />
        <View style={styles.androidRow}>
          <Text style={[styles.androidTitle, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="關閉"
            android_ripple={{ color: colors.border, borderless: true, radius: 24 }}
            style={styles.androidCloseButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
    );
  }

  const paddingTop = Math.max(insets.top, spacing.md);

  return (
    <View
      style={[styles.iosContainer, { paddingTop, backgroundColor: sheetBackground }, style]}
    >
      <View style={styles.iosRow}>
        <Text style={[styles.iosTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <ScalePressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="關閉"
          style={[styles.iosCloseButton, { backgroundColor: colors.surfaceMuted }]}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </ScalePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  androidContainer: {
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  androidHandle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  androidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  androidTitle: {
    ...typography.heading,
    flex: 1,
  },
  androidCloseButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosContainer: {
    paddingBottom: spacing.sm,
  },
  iosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  iosTitle: {
    ...typography.title,
    flex: 1,
  },
  iosCloseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
