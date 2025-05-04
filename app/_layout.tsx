import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
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
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return null; // Return null on error
  }
}
// --- Notification Setup End ---

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn } = useAuth();

  // --- Notification State & Effect Start ---
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Only register for notifications if user is signed in
    // You might want this logic elsewhere depending on your UX
    // (e.g., register immediately, or only after sign-in)
    if (isSignedIn) { 
      registerForPushNotificationsAsync()
        .then(token => setExpoPushToken(token ?? null))
        .catch((error: any) => {
          console.error('Error getting push token:', error);
          setExpoPushToken(null); // Set to null on error
        });
    } else {
      // Optionally handle the case where user is not signed in (e.g., clear token)
      setExpoPushToken(null);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification Received:', notification);
      // Handle received notification while app is foregrounded
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
      // Handle user tapping on notification
      // Example: navigate to a specific screen
      // const { screen } = response.notification.request.content.data;
      // if (screen) { router.push(screen); }
    });

    // Cleanup function
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
    // Add isSignedIn to dependencies if registration depends on it
  }, [isSignedIn]); 
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
