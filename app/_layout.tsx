import { createNavigationTheme } from '@/constants/navigation-theme';
import { HomeMenuProvider } from '@/contexts/HomeMenuContext';
import { NotificationInboxProvider } from '@/contexts/NotificationInboxContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { configureNotificationHandler, isPushEnabled } from '@/lib/push-notifications';
import { normalizeNotificationScreenPath } from '@/lib/notification-inbox';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { HERO_BANNER_PHOTO } from '@/lib/photo-url';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const navigationTheme = createNavigationTheme(colorScheme);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isPushEnabled()) return;

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data && typeof data.screen === 'string') {
        try {
          router.push(normalizeNotificationScreenPath(data.screen) as Href);
        } catch (error) {
          console.error(`Failed to navigate to screen: ${data.screen}`, error);
        }
      }
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        const data = response.notification.request.content.data;
        if (data && typeof data.screen === 'string') {
          router.push(normalizeNotificationScreenPath(data.screen) as Href);
        }
      })
      .catch((error: unknown) => {
        console.warn('[notifications] Failed to handle cold-start notification:', error);
      });

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitleAlign: 'center' }} />
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
            presentation: 'formSheet',
            sheetAllowedDetents: [1],
            sheetGrabberVisible: true,
            contentStyle: { flex: 1 },
          }}
        />
        <Stack.Screen
          name="gallery"
          options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="about"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="contact"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="galleryModal"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="noticeDetailModal"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: Platform.OS === 'android' ? [0.85] : [1],
            sheetGrabberVisible: Platform.OS === 'ios',
            contentStyle: { flex: 1 },
            headerShown: Platform.OS === 'ios',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      void Image.prefetch(HERO_BANNER_PHOTO);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!clerkPublishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env and add your Clerk key.',
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
      <NotificationInboxProvider>
        <HomeMenuProvider>
          <RootLayoutNav />
        </HomeMenuProvider>
      </NotificationInboxProvider>
    </ClerkProvider>
  );
}
