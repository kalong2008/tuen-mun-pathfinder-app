import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// --- Notification Setup Start ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  // Consider using a more robust error handling mechanism than alert
  console.error(errorMessage);
  // alert(errorMessage);
  // throw new Error(errorMessage); // Avoid throwing in root layout
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications');
    return null; // Return null instead of throwing
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return null; // Return null instead of throwing
  }
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return null; // Return null instead of throwing
  }
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log('Expo Push Token:', pushTokenString);
    await fetch('http://192.168.50.114:3000/api/register-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: pushTokenString,
      }),
    });
    console.log('Push token sent to server');

    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return null; // Return null on error
  }
}
// --- Notification Setup End ---

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // --- Notification State & Effect Start ---
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Always register for notifications on mount
    registerForPushNotificationsAsync()
      .catch((error: any) => {
        console.error('Error getting push token:', error);
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
      // Handle received notification while app is foregrounded
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
      const data = response.notification.request.content.data;
      
      // Check if data contains a screen property and navigate
      if (data && typeof data.screen === 'string') {
        try {
          console.log(`Navigating to screen: ${data.screen}`);
          router.push(data.screen as any); // Use router to navigate
        } catch (e) {
          console.error(`Failed to navigate to screen: ${data.screen}`, e);
        }
      } else {
        console.log('No screen specified in notification data or data is invalid.');
      }
    });

    // Cleanup function
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]); 
  // --- Notification State & Effect End ---

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitleAlign: 'center' }} />
        <Stack.Screen name="(auth)" options={{ title: "", headerTitleAlign: 'center', headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider 
      tokenCache={tokenCache} 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} // Ensure Clerk key is set
    >
      <RootLayoutNav />
    </ClerkProvider>
  );
}
