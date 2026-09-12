import { resolveNotificationTarget } from './notificationRouting';
import type { AppNotification } from '../api/services';

function notification(overrides: Partial<Pick<AppNotification, 'type' | 'data' | 'deep_link'>> = {}) {
  return {
    type: 'general',
    data: null,
    deep_link: null,
    ...overrides,
  };
}

describe('resolveNotificationTarget', () => {
  it('routes booking notifications to trips', () => {
    expect(resolveNotificationTarget(notification({ type: 'booking_created' }))).toEqual({
      kind: 'tab',
      screen: 'Trips',
    });
  });

  it('honors supported tab deep links', () => {
    expect(resolveNotificationTarget(notification({ deep_link: 'aoklevart://trips' }))).toEqual({
      kind: 'tab',
      screen: 'Trips',
    });
    expect(resolveNotificationTarget(notification({ deep_link: 'aoklevart://tabs/rewards' }))).toEqual({
      kind: 'tab',
      screen: 'Rewards',
    });
  });

  it('resolves a property deep link when a property id is present', () => {
    expect(resolveNotificationTarget(notification({
      type: 'promotion',
      deep_link: 'aoklevart://property/42?source=inbox',
    }))).toEqual({ kind: 'property', propertyId: 42 });
  });

  it('falls back to explore for promotions and inbox for unknown links', () => {
    expect(resolveNotificationTarget(notification({ type: 'promotion' }))).toEqual({
      kind: 'tab',
      screen: 'Explore',
    });
    expect(resolveNotificationTarget(notification({ deep_link: 'aoklevart://promotions' }))).toEqual({
      kind: 'tab',
      screen: 'Explore',
    });
    expect(resolveNotificationTarget(notification({ deep_link: 'aoklevart://unknown/42' }))).toEqual({
      kind: 'tab',
      screen: 'Notifications',
    });
  });
});
