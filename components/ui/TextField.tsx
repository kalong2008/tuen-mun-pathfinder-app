import { forwardRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

const INPUT_HEIGHT = 48;

type TextFieldProps = TextInputProps & {
  label: string;
  multiline?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, style, multiline = false, ...props },
  ref,
) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        includeFontPadding={false}
        style={[
          multiline ? styles.messageInput : styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    ...Platform.select({
      ios: {
        paddingVertical: (INPUT_HEIGHT - typography.body.fontSize) / 2,
      },
      android: {
        paddingVertical: 0,
      },
      default: {},
    }),
  },
  messageInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
  },
});
