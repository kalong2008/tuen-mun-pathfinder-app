import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  muted?: boolean;
  onPress?: () => void;
};

export function Card({ children, style, muted = false, onPress }: CardProps) {
  const { colors } = useAppTheme();

  const containerStyle = [
    styles.card,
    shadows.sm,
    {
      backgroundColor: muted ? colors.surfaceMuted : colors.surface,
      borderColor: colors.border,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
  },
});
