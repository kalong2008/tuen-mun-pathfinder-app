import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { headerContentGap } from '@/constants/theme';

export function useStickyHeaderContentInset(
  headerHeight: number,
  getFallbackHeaderHeight: (topInset: number) => number,
) {
  const insets = useSafeAreaInsets();
  const contentTopInset =
    (headerHeight || getFallbackHeaderHeight(insets.top)) + headerContentGap;

  // iOS NativeTabs adjusts scroll content insets for the status bar automatically.
  const scrollContentTopInset =
    Platform.OS === 'ios'
      ? Math.max(0, contentTopInset - insets.top)
      : contentTopInset;

  return { contentTopInset, scrollContentTopInset };
}
