import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { notificationService } from '../api/services';
import { getStoredValue, removeStoredValue, setStoredValue } from '../storage';

const PUSH_TOKEN_KEY = 'aoklevart_expo_push_token';
const isExpoGo = Constants.appOwnership === 'expo';
let notificationHandlerConfigured = false;

async function loadNotifications() {
  if (Platform.OS === 'web' || isExpoGo) return null;

  const Notifications = await import('expo-notifications');
  if (!notificationHandlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return Notifications;
}

function getProjectId() {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim()
    || Constants.easConfig?.projectId
    || Constants.expoConfig?.extra?.eas?.projectId
  );
}

export async function registerDeviceForPushNotifications() {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Aoklevart',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0b4b4f',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let finalStatus = existing.status;
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = getProjectId();
  if (!projectId) {
    console.warn(
      '[push] Missing Expo project id. Set EXPO_PUBLIC_EAS_PROJECT_ID in mobile/.env or extra.eas.projectId in app config.',
    );
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await setStoredValue(PUSH_TOKEN_KEY, token);
  await notificationService.registerPushToken({
    expo_push_token: token,
    platform: Platform.OS,
  });
  return token;
}

export async function unregisterStoredPushToken() {
  const token = await getStoredValue(PUSH_TOKEN_KEY);
  if (!token) return;

  await notificationService.unregisterPushToken(token).catch(() => undefined);
  await removeStoredValue(PUSH_TOKEN_KEY);
}

export function subscribeToPushNotifications(onChange: () => void) {
  if (Platform.OS === 'web' || isExpoGo) return () => undefined;

  let active = true;
  let cleanup = () => undefined;

  void loadNotifications().then((Notifications) => {
    if (!active || !Notifications) return;

    const received = Notifications.addNotificationReceivedListener(onChange);
    const response = Notifications.addNotificationResponseReceivedListener(onChange);
    cleanup = () => {
      received.remove();
      response.remove();
    };
  });

  return () => {
    active = false;
    cleanup();
  };
}
