import { StyleSheet } from 'react-native';

import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export function useTabStackScreenOptions() {
  const { colors } = useAppTheme();

  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleAlign: 'center' as const,
    headerTitleStyle: tabStackStyles.headerTitle,
  };
}

const tabStackStyles = StyleSheet.create({
  headerTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
  },
});

export const tabStackLayoutStyles = StyleSheet.create({
  headerSide: {
    paddingHorizontal: spacing.lg,
  },
});
