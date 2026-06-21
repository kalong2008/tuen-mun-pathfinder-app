import { Platform, TextStyle, ViewStyle } from 'react-native';

import { Colors, TARGET_COLORS } from '@/app/constants/colors';

export { TARGET_COLORS };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  heading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 26 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  subtitleEn: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1B4332',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    default: {},
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1B4332',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
} as const;

export type ColorScheme = 'light' | 'dark';

export function getThemeColors(scheme: ColorScheme) {
  const palette = Colors[scheme];

  return {
    ...palette,
    surface: scheme === 'light' ? '#FFFFFF' : '#1A2F23',
    surfaceMuted: scheme === 'light' ? '#EDE9E1' : '#243B2E',
    surfaceAccent: scheme === 'light' ? '#D8F3DC' : '#1B4332',
    border: scheme === 'light' ? '#D4CFC4' : '#3D5A47',
    borderStrong: scheme === 'light' ? '#B7B0A3' : '#52796F',
    muted: scheme === 'light' ? '#52796F' : '#95D5B2',
    overlay: 'rgba(27, 67, 50, 0.55)',
    tabBar: scheme === 'light' ? '#FFFFFF' : '#0D1B14',
    tabBarBorder: scheme === 'light' ? '#D4CFC4' : '#243B2E',
  };
}

export type ThemeColors = ReturnType<typeof getThemeColors>;
