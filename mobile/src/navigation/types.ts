import type { NavigatorScreenParams } from '@react-navigation/native';

import type { BookingDraft, Property } from '../types';

export type TabParamList = {
  Explore: undefined;
  Saved: undefined;
  Trips: undefined;
  Rewards: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Search: { query?: string } | undefined;
  Details: { property: Property };
  Payment: { draft: BookingDraft };
  PersonalInfo: undefined;
  Security: undefined;
  HelpCenter: undefined;
  Login: undefined;
  Unlock: undefined;
};
