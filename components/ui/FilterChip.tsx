import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { colors } = useAppTheme();

  return (
    <ScalePressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

type FilterRowProps = {
  title: string;
  children: ReactNode;
};

export function FilterRow({ title, children }: FilterRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowTitle, { color: colors.muted }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowScroll}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  row: {
    gap: spacing.sm,
  },
  rowTitle: {
    ...typography.label,
    paddingHorizontal: spacing.lg,
  },
  rowScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});

type ViewModeToggleProps = {
  value: 'card' | 'list';
  onChange: (value: 'card' | 'list') => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <FilterRow title="顯示">
      <FilterChip
        label="卡片"
        selected={value === 'card'}
        onPress={() => onChange('card')}
      />
      <FilterChip
        label="列表"
        selected={value === 'list'}
        onPress={() => onChange('list')}
      />
    </FilterRow>
  );
}
