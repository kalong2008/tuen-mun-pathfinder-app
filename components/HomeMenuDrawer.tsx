import { ReactNode, useEffect, useRef } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HomeMenuPanel } from '@/components/HomeMenuPanel';
import { radius } from '@/constants/theme';
import { useHomeMenu } from '@/contexts/HomeMenuContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.8;
const CONTENT_PEEK_WIDTH = SCREEN_WIDTH * 0.2;
const CONTENT_SCALE_OPEN = 0.9;
const MENU_SCALE_CLOSED = 0.88;

const OPEN_SPRING = { damping: 28, stiffness: 260, mass: 0.9 };
const CLOSE_SPRING = { damping: 30, stiffness: 280, mass: 0.85 };

type HomeMenuDrawerProps = {
  children: ReactNode;
};

export function HomeMenuDrawer({ children }: HomeMenuDrawerProps) {
  const { colors } = useAppTheme();
  const { navOpen, closeNav } = useHomeMenu();
  const wasOpenRef = useRef(false);
  const contentTranslateX = useSharedValue(0);
  const contentScale = useSharedValue(1);
  const menuScale = useSharedValue(MENU_SCALE_CLOSED);
  const menuOpacity = useSharedValue(0);

  useEffect(() => {
    if (navOpen) {
      wasOpenRef.current = true;
      contentTranslateX.value = withSpring(-MENU_WIDTH, OPEN_SPRING);
      contentScale.value = withSpring(CONTENT_SCALE_OPEN, OPEN_SPRING);
      menuScale.value = withSpring(1, OPEN_SPRING);
      menuOpacity.value = withSpring(1, OPEN_SPRING);
      return;
    }

    if (!wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = false;
    contentScale.value = withSpring(1, CLOSE_SPRING);
    menuScale.value = withSpring(MENU_SCALE_CLOSED, CLOSE_SPRING);
    menuOpacity.value = withSpring(0, CLOSE_SPRING);
    contentTranslateX.value = withSpring(0, CLOSE_SPRING);
  }, [navOpen, contentTranslateX, contentScale, menuScale, menuOpacity]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: contentTranslateX.value }, { scale: contentScale.value }],
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ scale: menuScale.value }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.menuLayer,
          menuAnimatedStyle,
          { width: MENU_WIDTH },
        ]}
      >
        <HomeMenuPanel />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentLayer,
          contentAnimatedStyle,
          { backgroundColor: colors.background },
          navOpen && styles.contentLayerOpen,
        ]}
        pointerEvents={navOpen ? 'none' : 'auto'}
      >
        {children}
      </Animated.View>

      {navOpen ? (
        <Pressable
          style={styles.peekCloseZone}
          onPress={closeNav}
          accessibilityRole="button"
          accessibilityLabel="關閉選單"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  menuLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    transformOrigin: 'right center',
  },
  contentLayer: {
    flex: 1,
    width: SCREEN_WIDTH,
    transformOrigin: 'left center',
  },
  contentLayerOpen: {
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: -8, height: 0 },
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  peekCloseZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: CONTENT_PEEK_WIDTH,
    zIndex: 20,
  },
});
