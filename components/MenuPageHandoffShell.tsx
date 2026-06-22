import { type Href } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { MenuPageHeader } from '@/components/MenuPageHeader';
import { headerContentGap, radius } from '@/constants/theme';
import { useHomeMenu, useMenuHandoff } from '@/contexts/HomeMenuContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.8;
const CONTENT_SCALE_OPEN = 0.9;
const CLOSE_SPRING = { damping: 30, stiffness: 280, mass: 0.85 };

type MenuPageHandoffShellProps = {
  route: Href;
  title: string;
  children: ReactNode;
};

export function MenuPageHandoffShell({ route, title, children }: MenuPageHandoffShellProps) {
  const isHandoff = useMenuHandoff(route);
  const { clearOverlayRoute } = useHomeMenu();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const peekProgress = useSharedValue(0);

  useEffect(() => {
    if (!isHandoff) {
      return;
    }

    translateX.value = -MENU_WIDTH;
    scale.value = CONTENT_SCALE_OPEN;
    peekProgress.value = 1;

    scale.value = withSpring(1, CLOSE_SPRING);
    peekProgress.value = withSpring(0, CLOSE_SPRING);
    translateX.value = withSpring(0, CLOSE_SPRING, (finished) => {
      if (finished) {
        runOnJS(clearOverlayRoute)();
      }
    });
  }, [isHandoff, translateX, scale, peekProgress, clearOverlayRoute]);

  const animatedShellStyle = useAnimatedStyle(() => {
    const progress = peekProgress.value;
    const cornerRadius = progress * radius.xl;

    return {
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
      borderTopLeftRadius: cornerRadius,
      borderBottomLeftRadius: cornerRadius,
      overflow: progress > 0.01 ? 'hidden' : 'visible',
    };
  });

  return (
    <Animated.View style={[styles.shell, animatedShellStyle]}>
      <MenuPageHeader title={title} />
      <View style={styles.body}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    transformOrigin: 'left center',
  },
  body: {
    flex: 1,
    paddingTop: headerContentGap,
  },
});
