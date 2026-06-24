import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type FilterMenuTriggerButtonProps = {
  accessibilityLabel: string;
  iconName: 'line.3.horizontal.decrease' | 'line.3.horizontal.decrease.circle';
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'glass' | 'plain';
};

export function FilterMenuTriggerButton({
  accessibilityLabel,
  iconName,
  iconSize = 17,
  style,
  variant = 'glass',
}: FilterMenuTriggerButtonProps) {
  const { colors } = useAppTheme();
  const isAndroidMenuTrigger = Platform.OS === 'android';

  const content =
    variant === 'glass' ? (
      <LiquidGlassSurface
        style={styles.buttonGlass}
        isInteractive={!isAndroidMenuTrigger}
        pointerEvents={isAndroidMenuTrigger ? 'none' : 'auto'}
      >
        <IconSymbol name={iconName} size={iconSize} color={colors.text} />
      </LiquidGlassSurface>
    ) : (
      <View
        style={styles.plainButtonInner}
        pointerEvents={isAndroidMenuTrigger ? 'none' : 'auto'}
      >
        <IconSymbol name={iconName} size={iconSize} color={colors.text} />
      </View>
    );

  if (isAndroidMenuTrigger) {
    return (
      <View
        collapsable={false}
        style={[styles.button, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      hitSlop={8}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  buttonGlass: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
