import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView, type BlurViewProps } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

export const GRADUAL_GLASS_FADE_HEIGHT = spacing.xxxl;

type LiquidGlassSurfaceProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  glassEffectStyle?: GlassStyle;
  isInteractive?: boolean;
  fallbackTint?: BlurViewProps["tint"];
  fallbackIntensity?: number;
};

type GradualLiquidGlassBackdropProps = Omit<
  LiquidGlassSurfaceProps,
  "children" | "isInteractive"
> & {
  fadeHeight?: number;
};

function canUseLiquidGlass() {
  return (
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable()
  );
}

function useBlurTint(fallbackTint?: BlurViewProps["tint"]) {
  const { isDark } = useAppTheme();

  return (
    fallbackTint ??
    (Platform.OS === "ios" ? "systemChromeMaterial" : isDark ? "dark" : "light")
  );
}

function LiquidGlassFill({
  style,
  glassEffectStyle = "regular",
  isInteractive = false,
  fallbackTint,
  fallbackIntensity = 100,
}: Omit<LiquidGlassSurfaceProps, "children">) {
  const { isDark } = useAppTheme();
  const blurTint = useBlurTint(fallbackTint);

  if (canUseLiquidGlass()) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        colorScheme={isDark ? "dark" : "light"}
      />
    );
  }

  return (
    <BlurView intensity={fallbackIntensity} tint={blurTint} style={style} />
  );
}

export function LiquidGlassSurface({
  style,
  children,
  glassEffectStyle = "regular",
  isInteractive = false,
  fallbackTint,
  fallbackIntensity = 100,
}: LiquidGlassSurfaceProps) {
  const { isDark } = useAppTheme();
  const blurTint = useBlurTint(fallbackTint);

  if (canUseLiquidGlass()) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        colorScheme={isDark ? "dark" : "light"}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView intensity={fallbackIntensity} tint={blurTint} style={style}>
      {children}
    </BlurView>
  );
}

export function LiquidGlassBackdrop(
  props: Omit<LiquidGlassSurfaceProps, "children" | "isInteractive">,
) {
  return (
    <LiquidGlassFill
      {...props}
      style={[StyleSheet.absoluteFill, props.style]}
    />
  );
}

export function GradualLiquidGlassBackdrop({
  fadeHeight = GRADUAL_GLASS_FADE_HEIGHT,
  glassEffectStyle = "regular",
  fallbackTint,
  fallbackIntensity = 100,
  style,
}: GradualLiquidGlassBackdropProps) {
  const glassLayer = (
    <LiquidGlassFill
      glassEffectStyle={glassEffectStyle}
      fallbackTint={fallbackTint}
      fallbackIntensity={fallbackIntensity}
      style={StyleSheet.absoluteFill}
    />
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.gradualBackdropShell, { bottom: -fadeHeight }, style]}
    >
      {Platform.OS === "ios" ? (
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={["#000000", "#000000", "transparent"]}
              locations={[0, 0.48, 1]}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          {glassLayer}
        </MaskedView>
      ) : (
        <>
          {glassLayer}
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.08)"]}
            style={styles.androidFadeOverlay}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gradualBackdropShell: {
    ...StyleSheet.absoluteFill,
  },
  androidFadeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: GRADUAL_GLASS_FADE_HEIGHT,
  },
});
