import type { AppNotification } from '../api/services';
import type { TabParamList } from '../navigation/types';

export type NotificationTab = keyof TabParamList;

export type NotificationTarget =
  | { kind: 'tab'; screen: NotificationTab }
  | { kind: 'property'; propertyId: number };

const tabRoutes: Record<string, NotificationTab> = {
  explore: 'Explore',
  saved: 'Saved',
  trips: 'Trips',
  rewards: 'Rewards',
  notifications: 'Notifications',
  profile: 'Profile',
};

function pathSegments(deepLink: string) {
  const withoutQuery = deepLink.trim().split(/[?#]/, 1)[0];
  const withoutScheme = withoutQuery.replace(/^[a-z][a-z\d+.-]*:\/\//i, '');
  return withoutScheme.split('/').filter(Boolean);
}

function positiveInteger(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function propertyIdFromData(data: AppNotification['data']) {
  if (!data) return null;
  return positiveInteger(data.propertyId ?? data.property_id);
}

export function resolveNotificationTarget(notification: Pick<AppNotification, 'type' | 'data' | 'deep_link'>): NotificationTarget {
  const segments = notification.deep_link ? pathSegments(notification.deep_link) : [];
  const route = segments[0]?.toLowerCase();
  const routeName = route === 'tabs' ? segments[1]?.toLowerCase() : route;

  if (routeName && tabRoutes[routeName]) {
    return { kind: 'tab', screen: tabRoutes[routeName] };
  }

  if (routeName === 'property' || routeName === 'properties') {
    const propertyId = positiveInteger(segments[1]) || propertyIdFromData(notification.data);
    if (propertyId) return { kind: 'property', propertyId };
  }

  if (routeName === 'promotion' || routeName === 'promotions' || routeName === 'offer' || routeName === 'offers') {
    return { kind: 'tab', screen: 'Explore' };
  }

  const type = notification.type.toLowerCase();
  if (type.includes('booking') || positiveInteger(notification.data?.bookingId ?? notification.data?.booking_id)) {
    return { kind: 'tab', screen: 'Trips' };
  }

  // The app has no standalone promotion/property list route. Explore is the
  // safe destination for discovery notifications; unsupported links stay in inbox.
  if (type.includes('promotion') || type.includes('offer')) {
    return { kind: 'tab', screen: 'Explore' };
  }

  return { kind: 'tab', screen: 'Notifications' };
}
