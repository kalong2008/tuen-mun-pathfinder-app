import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ScalePressableProps = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
};

export function ScalePressable({
  children,
  style,
  scale = 0.97,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        if (!disabled) {
          pressed.value = withSpring(scale, { damping: 15, stiffness: 400 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
