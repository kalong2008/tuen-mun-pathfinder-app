import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { FormSheetHeader } from '@/components/ui/FormSheetHeader';
import { TextField } from '@/components/ui/TextField';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect_url?: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const onSignInPress = async () => {
    if (!isLoaded || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: username,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        if (params.redirect_url) {
          router.replace(params.redirect_url);
        } else {
          router.back();
        }
      } else {
        setError('登入未完成，請再試一次');
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      setError('帳號或密碼錯誤');
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}
      >
        <FormSheetHeader
          title="會員登入"
          onClose={() => router.back()}
          backgroundColor={colors.background}
        />

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          登入後即可瀏覽活動相片
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: `${colors.danger}15` }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        <TextField
          label="帳號"
          placeholder="請輸入帳號"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="密碼"
          placeholder="請輸入密碼"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button label="登入" onPress={onSignInPress} loading={isLoading} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  subtitle: {
    ...typography.body,
  },
  errorBox: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
