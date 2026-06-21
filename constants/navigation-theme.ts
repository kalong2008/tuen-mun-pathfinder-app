import { DefaultTheme, Theme } from 'expo-router/react-navigation';

import { ColorScheme, getThemeColors } from '@/constants/theme';

export function createNavigationTheme(scheme: ColorScheme): Theme {
  const colors = getThemeColors(scheme);
  const isDark = scheme === 'dark';

  return {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
    fonts: DefaultTheme.fonts,
  };
}
