import { useSignIn } from '@clerk/clerk-expo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HERO_BANNER_PHOTO } from '@/lib/photo-url';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect_url?: string }>();
  const { colors } = useAppTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <Screen scroll edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <HeroBanner
          imageUri={HERO_BANNER_PHOTO}
          title="登入相簿"
          subtitle="屯門前鋒會 幼鋒會"
        />

        <Card>
          <Text style={[styles.title, { color: colors.text }]}>會員登入</Text>
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
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  errorBox: {
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
