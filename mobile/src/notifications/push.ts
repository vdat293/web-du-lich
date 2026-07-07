import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { getStoredValue, setStoredValue } from '../storage';

const PUSH_REGISTRATION_KEY = 'aoklevart_push_registration';
const EXPO_GO_PUSH_ERROR = 'Thông báo đẩy chỉ bật được trong development build hoặc bản app đã build. Expo Go không hỗ trợ đầy đủ push notification từ xa.';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushRegistration = {
  expo_push_token: string;
  provider: 'expo';
  platform: string;
  device_id?: string;
  expo_project_id?: string;
  app_version?: string;
  permission_status?: string;
};

export type PushInitResult = {
  registration: PushRegistration | null;
  permissionStatus: string;
  error?: string;
};

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId
    || Constants.easConfig?.projectId
    || process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

function getDeviceId() {
  const constants = Constants as typeof Constants & { sessionId?: string };
  return constants.sessionId;
}

async function configureAndroidChannels() {
  if (Platform.OS !== 'android') return;

  await Promise.all([
    Notifications.setNotificationChannelAsync('default', {
      name: 'Thông báo chung',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#012425',
    }),
    Notifications.setNotificationChannelAsync('bookings', {
      name: 'Đặt phòng',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#012425',
    }),
    Notifications.setNotificationChannelAsync('promotions', {
      name: 'Khuyến mãi',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250],
      lightColor: '#745b1c',
    }),
  ]);
}

export async function getStoredPushRegistration() {
  const raw = await getStoredValue(PUSH_REGISTRATION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PushRegistration;
  } catch {
    return null;
  }
}

export async function initializePushNotifications(): Promise<PushInitResult> {
  if (Platform.OS === 'web') {
    return { registration: null, permissionStatus: 'unsupported' };
  }

  if (Constants.appOwnership === 'expo') {
    return {
      registration: null,
      permissionStatus: 'unsupported',
      error: EXPO_GO_PUSH_ERROR,
    };
  }

  try {
    await configureAndroidChannels();

    const existing = await Notifications.getPermissionsAsync();
    let permissionStatus = existing.status;
    if (permissionStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      permissionStatus = requested.status;
    }

    if (permissionStatus !== 'granted') {
      return { registration: null, permissionStatus };
    }

    const projectId = getExpoProjectId();
    if (!projectId) {
      return {
        registration: null,
        permissionStatus,
        error: 'Missing Expo projectId. Set EXPO_PUBLIC_EAS_PROJECT_ID or app.json extra.eas.projectId.',
      };
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const registration: PushRegistration = {
      expo_push_token: token,
      provider: 'expo',
      platform: Platform.OS,
      device_id: getDeviceId(),
      expo_project_id: projectId,
      app_version: Constants.expoConfig?.version,
      permission_status: permissionStatus,
    };

    await setStoredValue(PUSH_REGISTRATION_KEY, JSON.stringify(registration));
    return { registration, permissionStatus };
  } catch (error) {
    return {
      registration: await getStoredPushRegistration(),
      permissionStatus: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function addPushReceivedListener(listener: (data: Record<string, unknown>) => void) {
  return Notifications.addNotificationReceivedListener((notification) => {
    listener(notification.request.content.data as Record<string, unknown>);
  });
}

export function addPushResponseListener(listener: (data: Record<string, unknown>) => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    listener(response.notification.request.content.data as Record<string, unknown>);
  });
}

export async function getLastPushResponseData() {
  const getLastResponse = Notifications.getLastNotificationResponseAsync
    || (async () => Notifications.getLastNotificationResponse());
  const response = await getLastResponse();
  return response?.notification.request.content.data as Record<string, unknown> | undefined;
}
