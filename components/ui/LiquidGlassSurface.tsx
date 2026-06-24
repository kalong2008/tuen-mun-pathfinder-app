import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type LiquidGlassSurfaceProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  glassEffectStyle?: GlassStyle;
  isInteractive?: boolean;
  fallbackTint?: BlurViewProps['tint'];
  fallbackIntensity?: number;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

function canUseLiquidGlass() {
  return Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}

export function LiquidGlassSurface({
  style,
  children,
  glassEffectStyle = 'regular',
  isInteractive = false,
  fallbackTint,
  fallbackIntensity = 100,
  pointerEvents,
}: LiquidGlassSurfaceProps) {
  const { isDark } = useAppTheme();

  if (canUseLiquidGlass()) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        colorScheme={isDark ? 'dark' : 'light'}
      >
        {children}
      </GlassView>
    );
  }

  const blurTint =
    fallbackTint ?? (Platform.OS === 'ios' ? 'systemChromeMaterial' : isDark ? 'dark' : 'light');

  return (
    <BlurView
      pointerEvents={pointerEvents}
      intensity={fallbackIntensity}
      tint={blurTint}
      style={style}
    >
      {children}
    </BlurView>
  );
}

export function LiquidGlassBackdrop({
  style,
  glassEffectStyle = 'regular',
  fallbackTint,
  fallbackIntensity = 100,
}: Omit<LiquidGlassSurfaceProps, 'children' | 'isInteractive'>) {
  const { isDark } = useAppTheme();

  if (canUseLiquidGlass()) {
    return (
      <GlassView
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, style]}
        glassEffectStyle={glassEffectStyle}
        colorScheme={isDark ? 'dark' : 'light'}
      />
    );
  }

  const blurTint =
    fallbackTint ?? (Platform.OS === 'ios' ? 'systemChromeMaterial' : isDark ? 'dark' : 'light');

  return (
    <BlurView
      pointerEvents="none"
      intensity={fallbackIntensity}
      tint={blurTint}
      style={[StyleSheet.absoluteFill, style]}
    />
  );
}
