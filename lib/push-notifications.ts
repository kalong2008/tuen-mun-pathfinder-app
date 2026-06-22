import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { API } from '@/lib/api';

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

export function isPushEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_PUSH === 'true';
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (!isPushEnabled()) return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function logPushRegistrationInfo(message: string) {
  console.info('[push]', message);
}

function logPushRegistrationError(errorMessage: string) {
  console.warn('[push]', errorMessage);
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isPushEnabled()) {
    logPushRegistrationInfo('Push notifications disabled (set EXPO_PUBLIC_ENABLE_PUSH=true to enable)');
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Constants.isDevice) {
      logPushRegistrationInfo('Push notifications require a physical device (simulator cannot register)');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      logPushRegistrationInfo('Push notification permission was not granted');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      logPushRegistrationError('EAS project ID not found');
      return null;
    }

    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    const response = await fetch(API.registerPush(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: pushTokenString,
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      logPushRegistrationError(`Failed to register push token (${response.status})`);
      return pushTokenString;
    }

    logPushRegistrationInfo('Push token registered');
    return pushTokenString;
  } catch (error) {
    logPushRegistrationError(`${error}`);
    return null;
  }
}

export function configureNotificationHandler() {
  if (!isPushEnabled()) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[push] Failed to configure notification handler:', error);
  }
}
