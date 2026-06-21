import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform } from 'react-native';

import { useTabBarScrollDirection } from '@/contexts/TabBarScrollDirectionContext';

const DIRECTION_THRESHOLD = 4;

export function useNativeTabScrollProps() {
  const { setScrollingUp } = useTabBarScrollDirection();
  const lastOffsetY = useRef(0);
  const isScrollingUpRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setScrollingUp(false);
      isScrollingUpRef.current = false;
      lastOffsetY.current = 0;

      return () => {
        setScrollingUp(false);
        isScrollingUpRef.current = false;
        lastOffsetY.current = 0;
      };
    }, [setScrollingUp]),
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const delta = offsetY - lastOffsetY.current;
      lastOffsetY.current = offsetY;

      if (delta < -DIRECTION_THRESHOLD) {
        if (!isScrollingUpRef.current) {
          isScrollingUpRef.current = true;
          setScrollingUp(true);
        }
        return;
      }

      if (delta > DIRECTION_THRESHOLD && isScrollingUpRef.current) {
        isScrollingUpRef.current = false;
        setScrollingUp(false);
      }
    },
    [setScrollingUp],
  );

  return {
    onScroll,
    scrollEventThrottle: 16 as const,
    contentInsetAdjustmentBehavior: Platform.OS === 'ios' ? ('automatic' as const) : undefined,
  };
}
